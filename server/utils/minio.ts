import { Client } from 'minio'

export const createMinioClient = () => {
  // 對於容器環境，使用內部 endpoint 進行操作
  const internalConfig = {
    endPoint: process.env.MINIO_ENDPOINT || 'localhost',
    port: parseInt(process.env.MINIO_PORT || '9000'),
    useSSL: process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY || 'admin',
    secretKey: process.env.MINIO_SECRET_KEY || 'admin123'
  }
  
  console.log('MinIO Client Config:', {
    endPoint: internalConfig.endPoint,
    port: internalConfig.port,
    useSSL: internalConfig.useSSL,
    accessKey: internalConfig.accessKey
  })
  
  return new Client(internalConfig)
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
    // 不使用 MinIO presigned URL，而是通過我們的 API 代理來提供圖片
    // 這樣避免了 hostname 替換導致的簽名問題
    const cacheBuster = `cb=${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    return `/api/background-image/${objectName}?${cacheBuster}`
  }
}
