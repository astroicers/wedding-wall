import { minioClient } from '~/server/utils/minio'

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

    const bucket = 'wedding-wall'
    
    // Check if wall exists by checking metadata
    const metadataPath = `users/${userId}/walls/${wallId}/metadata.json`
    try {
      await minioClient.statObject(bucket, metadataPath)
    } catch (error) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Wall not found'
      })
    }

    // Count message files for this wall
    const messagesPrefix = `users/${userId}/walls/${wallId}/messages/`
    let messageCount = 0
    const stream = minioClient.listObjectsV2(bucket, messagesPrefix, true)
    
    for await (const obj of stream) {
      if (obj.name?.endsWith('.json') && !obj.name.endsWith('/.keep')) {
        messageCount++
      }
    }

    return {
      count: messageCount,
      wallId,
      userId
    }
  } catch (error: any) {
    // If it's already a H3Error, re-throw it
    if (error.statusCode) {
      throw error
    }
    
    // Otherwise, create a generic server error
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to count wall messages'
    })
  }
})