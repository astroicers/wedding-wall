import { minioClient } from '~/server/utils/minio'
import { streamToString } from '~/server/utils/stream'
import type { Wall } from '~/types/wall'

export default defineEventHandler(async (event) => {
  try {
    const userId = getRouterParam(event, 'userId')
    
    if (!userId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'User ID is required'
      })
    }

    // Check authentication and permissions
    const authContext = event.context.auth
    if (!authContext?.isAuthenticated) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authentication required'
      })
    }

    // Users can only view their own walls
    if (authContext.userId !== userId) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Access denied'
      })
    }

    const bucket = 'wedding-wall'
    const wallsPrefix = `users/${userId}/walls/`
    
    // List all wall directories for the user
    const wallObjects: any[] = []
    const stream = minioClient.listObjectsV2(bucket, wallsPrefix, true)
    
    for await (const obj of stream) {
      if (obj.name?.endsWith('/metadata.json')) {
        wallObjects.push(obj)
      }
    }

    // Fetch wall metadata for each wall
    const walls: Wall[] = []
    
    for (const obj of wallObjects) {
      try {
        const objectStream = await minioClient.getObject(bucket, obj.name!)
        const metadataJson = await streamToString(objectStream)
        const wall: Wall = JSON.parse(metadataJson)
        
        // Calculate message count for this wall
        const wallId = wall.id
        const messagesPrefix = `users/${userId}/walls/${wallId}/messages/`
        
        let messageCount = 0
        const messagesStream = minioClient.listObjectsV2(bucket, messagesPrefix, true)
        
        for await (const messageObj of messagesStream) {
          if (messageObj.name?.endsWith('.json')) {
            messageCount++
          }
        }
        
        wall.messageCount = messageCount
        walls.push(wall)
      } catch (error) {
        console.error(`Failed to load wall metadata from ${obj.name}:`, error)
        // Continue with other walls even if one fails
      }
    }

    // Sort walls by creation date (newest first)
    walls.sort((a, b) => b.createdAt - a.createdAt)

    return walls
  } catch (error: any) {
    // If it's already a H3Error, re-throw it
    if (error.statusCode) {
      throw error
    }
    
    // Otherwise, create a generic server error
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to fetch user walls'
    })
  }
})