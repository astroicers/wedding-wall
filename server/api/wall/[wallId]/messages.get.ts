import { minioClient } from '~/server/utils/minio'
import { streamToString } from '~/server/utils/stream'
import type { MessageData } from '~/stores/messages'

export default defineEventHandler(async (event) => {
  try {
    const wallId = getRouterParam(event, 'wallId')
    
    if (!wallId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Wall ID is required'
      })
    }

    const bucket = 'wedding-wall'
    
    // 首先找到擁有這個墻的用戶
    let wallMetadata = null
    let foundUserId = null
    
    // 列出所有用戶目錄
    const usersStream = minioClient.listObjectsV2(bucket, 'users/', false)
    
    for await (const userObj of usersStream) {
      if (!userObj.name) continue
      
      // 提取用戶ID
      const userIdMatch = userObj.name.match(/users\/([^\/]+)\//)
      if (!userIdMatch) continue
      
      const userId = userIdMatch[1]
      
      try {
        // 檢查這個用戶是否有這個墻
        const metadataPath = `users/${userId}/walls/${wallId}/metadata.json`
        const metadataStream = await minioClient.getObject(bucket, metadataPath)
        const metadataJson = await streamToString(metadataStream)
        const metadata = JSON.parse(metadataJson)
        
        // 找到墻了
        wallMetadata = metadata
        foundUserId = userId
        break
      } catch (error) {
        // 這個用戶沒有這個墻，繼續查找
        continue
      }
    }
    
    if (!wallMetadata || !foundUserId) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Wall not found'
      })
    }

    // 檢查墻是否為公開
    if (!wallMetadata.isPublic) {
      throw createError({
        statusCode: 403,
        statusMessage: 'This wall is private'
      })
    }

    // 列出墻的所有消息文件
    const messagesPrefix = `users/${foundUserId}/walls/${wallId}/messages/`
    const messageObjects: any[] = []
    const stream = minioClient.listObjectsV2(bucket, messagesPrefix, true)
    
    for await (const obj of stream) {
      if (obj.name?.endsWith('.json') && !obj.name.endsWith('/.keep')) {
        messageObjects.push(obj)
      }
    }

    // 獲取並解析每個消息
    const messages: MessageData[] = []
    
    for (const obj of messageObjects) {
      try {
        const objectStream = await minioClient.getObject(bucket, obj.name!)
        const messageJson = await streamToString(objectStream)
        const message: MessageData = JSON.parse(messageJson)
        messages.push(message)
      } catch (error) {
        console.error(`Failed to load message from ${obj.name}:`, error)
        // 繼續處理其他消息，即使某個失敗
      }
    }

    // 根據墻設定過濾消息（公開墻只顯示已審核的消息）
    const filteredMessages = messages.filter(msg => msg.approved === 'approved')

    // 按時間戳排序（最舊的在前）
    filteredMessages.sort((a, b) => (a.createdAt || a.timestamp || 0) - (b.createdAt || b.timestamp || 0))

    console.log(`Public wall ${wallId}: 顯示 ${filteredMessages.length}/${messages.length} 條已審核消息`)

    return {
      messages: filteredMessages,
      wallId,
      userId: foundUserId,
      wallName: wallMetadata.name,
      totalCount: filteredMessages.length,
      totalRawCount: messages.length
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