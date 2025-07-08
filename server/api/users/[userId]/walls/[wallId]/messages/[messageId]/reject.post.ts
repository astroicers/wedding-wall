export default defineEventHandler(async (event) => {
  const userId = getRouterParam(event, 'userId')
  const wallId = getRouterParam(event, 'wallId')
  const messageId = getRouterParam(event, 'messageId')
  
  if (!userId || !wallId || !messageId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'User ID, Wall ID and Message ID are required'
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

  try {
    const minioClient = useMinioClient()
    const bucket = useRuntimeConfig().minioWeddingBucket

    // 獲取特定消息文件
    const messagePath = `users/${userId}/walls/${wallId}/messages/${messageId}.json`
    
    let message
    try {
      const objectStream = await minioClient.getObject(bucket, messagePath)
      const messageJson = await streamToString(objectStream)
      message = JSON.parse(messageJson)
    } catch (error) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Message not found'
      })
    }

    // 更新消息狀態
    message.approved = 'rejected'
    message.reviewedAt = Date.now()
    message.reviewedBy = authContext.userId

    // 保存更新的消息
    await minioClient.putObject(
      bucket,
      messagePath,
      JSON.stringify(message, null, 2),
      undefined,
      {
        'Content-Type': 'application/json'
      }
    )

    return {
      success: true,
      message: 'Message rejected successfully'
    }
  } catch (error) {
    console.error('Reject message error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to reject message'
    })
  }
})

// Helper function to convert stream to string
async function streamToString(stream: any): Promise<string> {
  const chunks: Buffer[] = []
  for await (const chunk of stream) {
    chunks.push(chunk)
  }
  return Buffer.concat(chunks).toString('utf-8')
}