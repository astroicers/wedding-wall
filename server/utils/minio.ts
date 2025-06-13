import { Client } from 'minio'

const createMinioClient = () => {
  const config = {
    endPoint: process.env.MINIO_ENDPOINT || 'localhost',
    port: parseInt(process.env.MINIO_PORT || '9000'),
    useSSL: process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY || 'admin',
    secretKey: process.env.MINIO_SECRET_KEY || 'admin123'
  }
  
  console.log('MinIO Client Config:', {
    endPoint: config.endPoint,
    port: config.port,
    useSSL: config.useSSL,
    accessKey: config.accessKey
  })
  
  return new Client(config)
}

export const MinioClient = createMinioClient()

export const BUCKET_NAME = process.env.MINIO_BUCKET_NAME || 'wedding-wall'

export const MinioService = {
  async healthCheck() {
    try {
      // 嘗試列出 buckets 來檢查連接
      await MinioClient.listBuckets()
      return true
    } catch (error) {
      console.error('MinIO health check failed:', error)
      return false
    }
  },

  async uploadFile(fileName: string, buffer: Buffer, contentType?: string, bucketName?: string) {
    const bucket = bucketName || BUCKET_NAME
    const metadata = contentType ? { 'Content-Type': contentType } : {}
    await MinioClient.putObject(bucket, fileName, buffer, buffer.length, metadata)
    return fileName
  },

  async uploadJson(fileName: string, data: any) {
    const jsonBuffer = Buffer.from(JSON.stringify(data, null, 2))
    await MinioClient.putObject(BUCKET_NAME, fileName, jsonBuffer, jsonBuffer.length, {
      'Content-Type': 'application/json'
    })
    return fileName
  },

  async getFile(fileName: string, bucketName?: string) {
    const bucket = bucketName || BUCKET_NAME
    return await MinioClient.getObject(bucket, fileName)
  },

  async listFiles(prefix?: string) {
    const stream = MinioClient.listObjects(BUCKET_NAME, prefix, true)
    const files = []
    for await (const obj of stream) {
      files.push(obj)
    }
    return files
  },

  async listObjects(bucketName: string, prefix?: string) {
    const stream = MinioClient.listObjects(bucketName, prefix, true)
    const objects = []
    for await (const obj of stream) {
      objects.push(obj)
    }
    return objects
  },

  async deleteFile(fileName: string) {
    await MinioClient.removeObject(BUCKET_NAME, fileName)
  },

  async deleteObject(bucketName: string, objectName: string) {
    await MinioClient.removeObject(bucketName, objectName)
  },

  async ensureBucket(bucketName: string) {
    try {
      const exists = await MinioClient.bucketExists(bucketName)
      if (!exists) {
        await MinioClient.makeBucket(bucketName, 'us-east-1')
        console.log(`Created MinIO bucket: ${bucketName}`)
      }
    } catch (error) {
      console.error(`Failed to ensure bucket ${bucketName}:`, error)
      throw error
    }
  },

  async getPresignedUrl(bucketName: string, objectName: string, expiry: number = 7 * 24 * 60 * 60) {
    const url = await MinioClient.presignedGetObject(bucketName, objectName, expiry)
    // 將容器內的 minio 主機名替換為 localhost，供瀏覽器訪問
    let finalUrl = url.replace('minio:9000', 'localhost:9000')
    
    // 加入快取破壞參數來解決 Chromium 瀏覽器快取問題
    const separator = finalUrl.includes('?') ? '&' : '?'
    const cacheBuster = `cb=${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    finalUrl += `${separator}${cacheBuster}`
    
    return finalUrl
  }
}
