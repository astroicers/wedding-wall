import { MinioService } from '~/server/utils/minio'

export default defineEventHandler(async (event) => {
  try {
    const bucketName = 'wedding-wall'
    
    // 確保 bucket 存在
    await MinioService.ensureBucket(bucketName)
    
    // 列出所有 metadata 檔案
    const metadataFiles = await MinioService.listFiles('metadata/')
    
    const messages = []
    
    // 讀取每個 metadata 檔案
    for (const file of metadataFiles) {
      try {
        const stream = await MinioService.getFile(file.name)
        const chunks = []
        
        for await (const chunk of stream) {
          chunks.push(chunk)
        }
        
        const data = Buffer.concat(chunks).toString()
        const messageData = JSON.parse(data)
        
        // 確保圖片 URL 正確
        if (messageData.photo) {
          // 修復重複的 /api/image/ 路徑問題
          if (messageData.photo.includes('/api/image//api/image/')) {
            messageData.photo = messageData.photo.replace('/api/image//api/image/', '/api/image/')
          } else if (!messageData.photo.startsWith('http') && !messageData.photo.startsWith('/api/image/')) {
            // 如果只是檔名，加入完整路徑
            messageData.photo = `/api/image/${messageData.photo}`
          }
        }
        
        // 如果沒有審核狀態，設為 pending
        if (!messageData.approved) {
          messageData.approved = 'pending'
        }
        
        // 轉換時間戳
        if (messageData.timestamp && typeof messageData.timestamp === 'string') {
          messageData.timestamp = new Date(messageData.timestamp).getTime()
        }
        
        messages.push(messageData)
      } catch (error) {
        console.warn(`無法讀取訊息檔案 ${file.name}:`, error)
      }
    }
    
    // 按時間戳排序（最新的在前）
    messages.sort((a, b) => {
      const timeA = a.timestamp || 0
      const timeB = b.timestamp || 0
      return timeB - timeA
    })
    
    console.log(`管理員載入了 ${messages.length} 則訊息`)
    
    return {
      success: true,
      messages,
      total: messages.length,
      stats: {
        total: messages.length,
        approved: messages.filter(m => m.approved === 'approved').length,
        pending: messages.filter(m => m.approved === 'pending').length,
        rejected: messages.filter(m => m.approved === 'rejected').length,
        withPhoto: messages.filter(m => m.photo).length
      }
    }
    
  } catch (error: any) {
    console.error('管理員載入訊息失敗:', error)
    
    return {
      success: false,
      error: error.message || '載入訊息失敗',
      messages: [],
      total: 0,
      stats: {
        total: 0,
        approved: 0,
        pending: 0,
        rejected: 0,
        withPhoto: 0
      }
    }
  }
})