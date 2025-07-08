import { minioClient } from '~/server/utils/minio'

export default defineEventHandler(async (event) => {
  try {
    const userId = getRouterParam(event, 'userId')
    const wallId = getRouterParam(event, 'wallId')
    const messageId = getRouterParam(event, 'messageId')
    
    if (!userId || !wallId || !messageId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'User ID, Wall ID, and Message ID are required'
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

    // Check if user is authorized to delete messages from this wall
    if (authContext.userId !== userId) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Access denied'
      })
    }

    const bucket = 'wedding-wall'
    
    // First, get the message metadata to find the associated image
    const messagePath = `users/${userId}/walls/${wallId}/messages/${messageId}.json`
    let messageData
    
    try {
      const messageStream = await minioClient.getObject(bucket, messagePath)
      let messageJson = ''
      
      for await (const chunk of messageStream) {
        messageJson += chunk.toString()
      }
      
      messageData = JSON.parse(messageJson)
    } catch (error) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Message not found'
      })
    }

    // Delete the image file if it exists
    if (messageData.imagePath) {
      try {
        await minioClient.removeObject(bucket, messageData.imagePath)
        console.log(`Deleted image: ${messageData.imagePath}`)
      } catch (error) {
        console.warn(`Failed to delete image ${messageData.imagePath}:`, error)
        // Continue with deleting the message even if image deletion fails
      }
    }

    // Delete the message metadata file
    await minioClient.removeObject(bucket, messagePath)
    console.log(`Deleted message: ${messagePath}`)

    return {
      success: true,
      message: 'Message deleted successfully',
      deletedId: messageId
    }
  } catch (error: any) {
    // If it's already a H3Error, re-throw it
    if (error.statusCode) {
      throw error
    }
    
    // Otherwise, create a generic server error
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to delete message'
    })
  }
})