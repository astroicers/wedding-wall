import { MinioClient, BUCKET_NAME } from './minio'

export async function initializeMinio() {
  try {
    // 檢查 bucket 是否存在
    const bucketExists = await MinioClient.bucketExists(BUCKET_NAME)
    
    if (!bucketExists) {
      console.log(`建立 MinIO bucket: ${BUCKET_NAME}`)
      await MinioClient.makeBucket(BUCKET_NAME)
      console.log(`✅ Bucket ${BUCKET_NAME} 建立成功`)
    } else {
      console.log(`✅ Bucket ${BUCKET_NAME} 已存在`)
    }

    return true
  } catch (error) {
    console.error('❌ 初始化 MinIO 失敗:', error)
    return false
  }
}