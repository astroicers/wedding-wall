import { MinioService } from '~/server/utils/minio'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { timestamp, approved } = body
    
    if (!timestamp || !approved) {
      throw createError({
        statusCode: 400,
        statusMessage: '缺少必要參數'
      })
    }
    
    if (!['approved', 'rejected', 'pending'].includes(approved)) {
      throw createError({
        statusCode: 400,
        statusMessage: '無效的審核狀態'
      })
    }
    
    const bucketName = 'wedding-wall'
    
    // 確保 bucket 存在
    await MinioService.ensureBucket(bucketName)
    
    // 列出所有 metadata 檔案
    const metadataFiles = await MinioService.listFiles('metadata/')
    
    // 尋找對應的 metadata 檔案
    let targetFile = null
    let messageData = null
    
    for (const file of metadataFiles) {
      try {
        const stream = await MinioService.getFile(file.name)
        const chunks = []
        
        for await (const chunk of stream) {
          chunks.push(chunk)
        }
        
        const data = Buffer.concat(chunks).toString()
        const metadata = JSON.parse(data)
        
        // 轉換時間戳進行比較
        let metadataTimestamp = metadata.timestamp
        if (typeof metadataTimestamp === 'string') {
          metadataTimestamp = new Date(metadataTimestamp).getTime()
        }
        
        if (metadataTimestamp === timestamp) {
          targetFile = file.name
          messageData = metadata
          break
        }
      } catch (error) {
        console.warn(`無法讀取訊息檔案 ${file.name}:`, error)
      }
    }
    
    if (!targetFile || !messageData) {
      throw createError({
        statusCode: 404,
        statusMessage: '找不到對應的留言'
      })
    }
    
    // 更新審核狀態
    messageData.approved = approved
    messageData.moderatedAt = new Date().toISOString()
    
    // 上傳更新後的 metadata
    await MinioService.uploadJson(targetFile, messageData)
    
    console.log(`留言審核狀態已更新: ${targetFile} -> ${approved}`)
    
    return {
      success: true,
      message: '審核狀態已更新',
      approved,
      timestamp
    }
    
  } catch (error: any) {
    console.error('更新審核狀態失敗:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: '更新審核狀態失敗'
    })
  }
})