import { Client } from 'minio'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const settings = body.settings

    if (!settings) {
      return {
        success: false,
        error: '缺少設定資料'
      }
    }

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

    // 添加最後更新時間
    const settingsWithTimestamp = {
      ...settings,
      lastUpdated: new Date().toISOString()
    }

    // 將設定轉換為 JSON 字串
    const settingsJson = JSON.stringify(settingsWithTimestamp, null, 2)
    const buffer = Buffer.from(settingsJson, 'utf8')

    // 檢查 bucket 是否存在
    const bucketExists = await minioClient.bucketExists(bucketName)
    if (!bucketExists) {
      await minioClient.makeBucket(bucketName)
    }

    // 上傳設定到 MinIO
    await minioClient.putObject(
      bucketName,
      settingsKey,
      buffer,
      buffer.length,
      {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    )

    console.log('管理員設定已更新:', settingsWithTimestamp)

    return {
      success: true,
      message: '設定已儲存',
      settings: settingsWithTimestamp
    }
  } catch (error) {
    console.error('儲存管理員設定失敗:', error)
    return {
      success: false,
      error: '儲存設定失敗: ' + error.message
    }
  }
})