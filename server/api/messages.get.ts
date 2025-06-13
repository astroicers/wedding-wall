import { MinioService } from '~/server/utils/minio'
import { Client } from 'minio'

export default defineEventHandler(async (event) => {
  try {
    const bucketName = 'wedding-wall'
    
    // 獲取管理員設定
    const settings = await getAdminSettings()
    
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
        
        // 根據管理員設定決定要顯示哪些留言
        const shouldShowMessage = shouldIncludeMessage(messageData, settings)
        if (shouldShowMessage) {
          messages.push(messageData)
        }
      } catch (error) {
        console.warn(`無法讀取訊息檔案 ${file.name}:`, error)
      }
    }
    
    // 按時間戳排序（如果有的話）
    messages.sort((a, b) => {
      const timeA = a.timestamp || 0
      const timeB = b.timestamp || 0
      return timeB - timeA
    })
    
    console.log(`載入了 ${messages.length} 則訊息`)
    
    return {
      success: true,
      messages,
      total: messages.length
    }
    
  } catch (error: any) {
    console.error('載入訊息失敗:', error)
    
    return {
      success: false,
      error: error.message || '載入訊息失敗',
      messages: [],
      total: 0
    }
  }
})

// 決定是否要包含此留言在顯示中
function shouldIncludeMessage(messageData: any, settings: any): boolean {
  const approvalStatus = messageData.approved || 'pending'
  
  // 總是顯示已審核通過的留言
  if (approvalStatus === 'approved') {
    return true
  }
  
  // 從不顯示被拒絕的留言
  if (approvalStatus === 'rejected') {
    return false
  }
  
  // 對於待審核的留言，檢查設定
  if (approvalStatus === 'pending') {
    return settings.showUnmoderated === true
  }
  
  return false
}

// 獲取管理員設定
async function getAdminSettings() {
  try {
    const minioClient = new Client({
      endPoint: 'minio',
      port: 9000,
      useSSL: false,
      accessKey: 'admin',
      secretKey: 'admin123'
    })

    const bucketName = 'wedding-wall'
    const settingsKey = 'admin-settings.json'

    const stream = await minioClient.getObject(bucketName, settingsKey)
    
    return new Promise((resolve) => {
      let settingsData = ''
      
      stream.on('data', (chunk) => {
        settingsData += chunk.toString()
      })
      
      stream.on('end', () => {
        try {
          const settings = JSON.parse(settingsData)
          resolve(settings)
        } catch (error) {
          resolve(getDefaultSettings())
        }
      })
      
      stream.on('error', () => {
        resolve(getDefaultSettings())
      })
    })
  } catch (error) {
    return getDefaultSettings()
  }
}

function getDefaultSettings() {
  return {
    autoApprove: false,
    showUnmoderated: false,
    autoApproveKeywords: '',
    autoRejectKeywords: ''
  }
}