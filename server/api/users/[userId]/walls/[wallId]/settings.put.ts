import { minioClient } from '~/server/utils/minio'
import { streamToString } from '~/server/utils/stream'

export default defineEventHandler(async (event) => {
  try {
    const userId = getRouterParam(event, 'userId')
    const wallId = getRouterParam(event, 'wallId')
    
    if (!userId || !wallId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'User ID and Wall ID are required'
      })
    }

    // Check authentication
    const authContext = event.context.auth
    if (!authContext?.isAuthenticated) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authentication required'
      })
    }

    // Check if user is authorized to update this wall
    if (authContext.userId !== userId) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Access denied'
      })
    }

    // Get the request body
    const body = await readBody(event)
    
    // Validate required fields
    if (!body.name || typeof body.name !== 'string') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Wall name is required'
      })
    }

    if (!body.displayMode || typeof body.displayMode !== 'string') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Display mode is required'
      })
    }

    const bucket = 'wedding-wall'
    const metadataPath = `users/${userId}/walls/${wallId}/metadata.json`
    
    // Get current wall metadata
    let currentMetadata
    try {
      const metadataStream = await minioClient.getObject(bucket, metadataPath)
      const metadataJson = await streamToString(metadataStream)
      currentMetadata = JSON.parse(metadataJson)
    } catch (error) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Wall not found'
      })
    }

    // Update the metadata with new settings
    const updatedMetadata = {
      ...currentMetadata,
      name: body.name.trim(),
      settings: {
        ...currentMetadata.settings,
        ...(body.settings || {}), // 合併所有設定
        displayMode: body.displayMode || body.settings?.displayMode || currentMetadata.settings.displayMode
      },
      isActive: typeof body.isActive === 'boolean' ? body.isActive : currentMetadata.isActive,
      updatedAt: Date.now()
    }

    // Validate display mode
    const validDisplayModes = ['grid', 'polaroid', 'magazine', 'stories', 'enhanced']
    if (!validDisplayModes.includes(updatedMetadata.settings.displayMode)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid display mode'
      })
    }

    // Save updated metadata
    const metadataBuffer = Buffer.from(JSON.stringify(updatedMetadata, null, 2))
    await minioClient.putObject(bucket, metadataPath, metadataBuffer, metadataBuffer.length, {
      'Content-Type': 'application/json'
    })

    console.log(`Wall settings updated for ${wallId}:`, {
      name: updatedMetadata.name,
      displayMode: updatedMetadata.settings.displayMode,
      isActive: updatedMetadata.isActive
    })

    return {
      success: true,
      message: 'Wall settings updated successfully',
      wall: updatedMetadata
    }
  } catch (error: any) {
    // If it's already a H3Error, re-throw it
    if (error.statusCode) {
      throw error
    }
    
    // Otherwise, create a generic server error
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to update wall settings'
    })
  }
})