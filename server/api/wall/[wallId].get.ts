import { minioClient } from '~/server/utils/minio'
import { streamToString } from '~/server/utils/stream'

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
    
    // 嘗試從所有用戶中尋找這個墻
    let wallMetadata = null
    let foundUserId = null
    
    // 列出所有用戶目錄
    try {
      const usersStream = minioClient.listObjectsV2(bucket, 'users/', false)
      
      for await (const userObj of usersStream) {
        if (!userObj.name) continue
        
        // 提取用戶ID - 應該是 users/userId/ 格式
        const userIdMatch = userObj.name.match(/users\/([^\/]+)\/$/)
        if (!userIdMatch) continue
        
        const userId = userIdMatch[1]
        console.log(`Checking user ${userId} for wall ${wallId}`)
        
        try {
          // 檢查這個用戶是否有這個墻
          const metadataPath = `users/${userId}/walls/${wallId}/metadata.json`
          console.log(`Trying to get: ${metadataPath}`)
          const metadataStream = await minioClient.getObject(bucket, metadataPath)
          const metadataJson = await streamToString(metadataStream)
          const metadata = JSON.parse(metadataJson)
          
          console.log(`Found wall ${wallId} for user ${userId}`)
          // 找到墻了
          wallMetadata = metadata
          foundUserId = userId
          break
        } catch (error) {
          // 這個用戶沒有這個墻，繼續查找
          console.log(`User ${userId} doesn't have wall ${wallId}:`, error.message)
          continue
        }
      }
    } catch (error) {
      console.error('Error listing users:', error)
    }
    
    if (!wallMetadata) {
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

    return {
      ...wallMetadata,
      userId: foundUserId
    }
  } catch (error: any) {
    // If it's already a H3Error, re-throw it
    if (error.statusCode) {
      throw error
    }
    
    // Otherwise, create a generic server error
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to fetch wall'
    })
  }
})