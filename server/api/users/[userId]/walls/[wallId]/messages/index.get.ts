import { minioClient } from '~/server/utils/minio'
import { streamToString } from '~/server/utils/stream'
import type { MessageData } from '~/stores/messages'

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
    
    // First, check if the wall exists and get its metadata
    const metadataPath = `users/${userId}/walls/${wallId}/metadata.json`
    let wallMetadata
    
    try {
      const metadataStream = await minioClient.getObject(bucket, metadataPath)
      const metadataJson = await streamToString(metadataStream)
      wallMetadata = JSON.parse(metadataJson)
    } catch (error) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Wall not found'
      })
    }

    // Check permissions: users can access their own walls, or public walls
    const canAccess = authContext.userId === userId || wallMetadata.isPublic
    
    if (!canAccess) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Access denied'
      })
    }

    // List all message files for this wall
    const messagesPrefix = `users/${userId}/walls/${wallId}/messages/`
    const messageObjects: any[] = []
    const stream = minioClient.listObjectsV2(bucket, messagesPrefix, true)
    
    for await (const obj of stream) {
      if (obj.name?.endsWith('.json') && !obj.name.endsWith('/.keep')) {
        messageObjects.push(obj)
      }
    }

    // Fetch and parse each message
    const messages: MessageData[] = []
    
    for (const obj of messageObjects) {
      try {
        const objectStream = await minioClient.getObject(bucket, obj.name!)
        const messageJson = await streamToString(objectStream)
        const message: MessageData = JSON.parse(messageJson)
        
        // 转换数据格式以与原始祝福墙组件兼容
        const compatMessage = {
          ...message,
          text: message.message || message.text || '', // 确保有text字段
          photo: message.imagePath ? `/api/image/${message.imagePath}` : (message.photo || ''), // 转换图片路径
          timestamp: message.createdAt || message.timestamp || Date.now(),
          status: message.approved || 'pending' // 添加status字段供管理界面使用
        }
        
        messages.push(compatMessage)
      } catch (error) {
        console.error(`Failed to load message from ${obj.name}:`, error)
        // Continue with other messages even if one fails
      }
    }

    // 根據墻設定過濾消息
    let filteredMessages = messages
    
    // 檢查墻設定是否顯示未審核的消息
    const showUnmoderated = wallMetadata.settings?.showUnmoderated || false
    
    if (!showUnmoderated) {
      // 只顯示已審核通過的消息
      filteredMessages = messages.filter(msg => msg.approved === 'approved')
      console.log(`墻 ${wallId}: 過濾後 ${filteredMessages.length}/${messages.length} 條消息（只顯示已審核）`)
    } else {
      console.log(`墻 ${wallId}: 顯示所有 ${messages.length} 條消息（包含未審核）`)
    }

    // Sort messages by timestamp (oldest first, using both timestamp and createdAt for compatibility)
    filteredMessages.sort((a, b) => (a.createdAt || a.timestamp || 0) - (b.createdAt || b.timestamp || 0))

    return {
      success: true,
      messages: filteredMessages,
      wallId,
      userId,
      wallName: wallMetadata.name,
      totalCount: filteredMessages.length,
      totalRawCount: messages.length // 包含未過濾的總數
    }
  } catch (error: any) {
    // If it's already a H3Error, re-throw it
    if (error.statusCode) {
      throw error
    }
    
    // Otherwise, create a generic server error
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to fetch wall messages'
    })
  }
})