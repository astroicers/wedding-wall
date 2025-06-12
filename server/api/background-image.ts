import { MinioService } from '~/server/utils/minio'

export default defineEventHandler(async (event) => {
  try {
    const bucketName = 'wedding-background'
    
    // 獲取背景圖片列表
    const objects = await MinioService.listObjects(bucketName, 'background.')
    
    if (objects.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: '背景圖片不存在'
      })
    }

    // 獲取第一個背景圖片
    const objectName = objects[0].name
    const stream = await MinioService.getFile(objectName, bucketName)

    // 設定正確的 MIME 類型
    const ext = objectName.split('.').pop()?.toLowerCase()
    const contentType = getContentType(ext)

    setHeader(event, 'Content-Type', contentType)
    setHeader(event, 'Cache-Control', 'public, max-age=3600') // 快取 1 小時
    
    return sendStream(event, stream)
  } catch (err: any) {
    console.error('[BACKGROUND] 取得背景圖片失敗:', err)
    
    if (err.code === 'NoSuchKey' || err.statusCode === 404) {
      throw createError({
        statusCode: 404,
        statusMessage: '背景圖片不存在'
      })
    }
    
    if (err.statusCode) {
      throw err
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: '取得背景圖片失敗'
    })
  }
})

function getContentType(ext?: string): string {
  const mimeTypes: Record<string, string> = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg', 
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'bmp': 'image/bmp',
    'svg': 'image/svg+xml'
  }
  
  return mimeTypes[ext || ''] || 'application/octet-stream'
}