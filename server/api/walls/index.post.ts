import { minioClient } from '~/server/utils/minio'
import type { Wall, CreateWallData, defaultWallSettings, generateSlug, generateWallId } from '~/types/wall'

export default defineEventHandler(async (event) => {
  try {
    // Check authentication
    const authContext = event.context.auth
    if (!authContext?.isAuthenticated) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authentication required'
      })
    }

    const body = await readBody(event) as CreateWallData & { userId: string }
    
    // Validate required fields
    if (!body.name || !body.userId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Wall name and user ID are required'
      })
    }

    // Verify user can only create walls for themselves
    if (authContext.userId !== body.userId) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Cannot create wall for another user'
      })
    }

    // Import helper functions dynamically
    const { defaultWallSettings, generateSlug, generateWallId } = await import('~/types/wall')
    
    // Generate wall data
    const wallId = generateWallId()
    const slug = generateSlug(body.name)
    const now = Date.now()

    const wall: Wall = {
      id: wallId,
      userId: body.userId,
      name: body.name.trim(),
      description: body.description?.trim() || '',
      slug,
      isActive: true,
      isPublic: body.isPublic ?? true,
      createdAt: now,
      updatedAt: now,
      settings: {
        ...defaultWallSettings,
        ...body.settings
      },
      messageCount: 0
    }

    // Store wall metadata in MinIO
    const bucket = 'wedding-wall'
    const metadataPath = `users/${body.userId}/walls/${wallId}/metadata.json`
    
    await minioClient.putObject(
      bucket,
      metadataPath,
      JSON.stringify(wall, null, 2),
      {
        'Content-Type': 'application/json'
      }
    )

    // Create initial empty messages directory
    const messagesIndexPath = `users/${body.userId}/walls/${wallId}/messages/.keep`
    await minioClient.putObject(
      bucket,
      messagesIndexPath,
      '',
      {
        'Content-Type': 'text/plain'
      }
    )

    console.log(`Wall created: ${wallId} for user ${body.userId}`)
    
    return wall
  } catch (error: any) {
    // If it's already a H3Error, re-throw it
    if (error.statusCode) {
      throw error
    }
    
    console.error('Failed to create wall:', error)
    
    // Otherwise, create a generic server error
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to create wall'
    })
  }
})