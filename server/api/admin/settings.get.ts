import { Client } from 'minio'

export default defineEventHandler(async (event) => {
  try {
    // 初始化 MinIO 客戶端
    const minioClient = new Client({
      endPoint: 'minio',
      port: 9000,
      useSSL: false,
      accessKey: 'admin',
      secretKey: 'admin123'
    })

    const bucketName = 'wedding-wall'
    const settingsKey = 'admin-settings.json'

    try {
      // 嘗試從 MinIO 獲取設定
      const stream = await minioClient.getObject(bucketName, settingsKey)
      
      return new Promise((resolve, reject) => {
        let settingsData = ''
        
        stream.on('data', (chunk) => {
          settingsData += chunk.toString()
        })
        
        stream.on('end', () => {
          try {
            const settings = JSON.parse(settingsData)
            resolve({ success: true, settings })
          } catch (error) {
            console.error('解析設定檔案失敗:', error)
            resolve({ 
              success: true, 
              settings: getDefaultSettings() 
            })
          }
        })
        
        stream.on('error', (error) => {
          console.error('讀取設定檔案失敗:', error)
          resolve({ 
            success: true, 
            settings: getDefaultSettings() 
          })
        })
      })
    } catch (error) {
      console.log('設定檔案不存在，使用預設設定')
      return {
        success: true,
        settings: getDefaultSettings()
      }
    }
  } catch (error) {
    console.error('獲取管理員設定失敗:', error)
    return {
      success: false,
      error: '獲取設定失敗',
      settings: getDefaultSettings()
    }
  }
})

function getDefaultSettings() {
  return {
    // 審核設定
    autoApprove: false,
    showUnmoderated: false,
    autoApproveKeywords: '',
    autoRejectKeywords: '',
    
    // 祝福牆設定
    wallTitle: '祝福牆',
    wallSubtitle: '',
    titleColor: '#2c3e50',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    fontSize: 48,
    autoplayDelay: 3,
    imageDelay: 1,
    
    // 系統設定
    lastUpdated: new Date().toISOString()
  }
}