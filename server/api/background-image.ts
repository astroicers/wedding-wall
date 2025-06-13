import { MinioService } from '~/server/utils/minio'

export default defineEventHandler(async (event) => {
  try {
    const bucketName = 'wedding-background'
    const objectName = 'background.jpg'
    
    // 直接獲取固定檔名的背景圖片
    const stream = await MinioService.getFile(objectName, bucketName)

    // 設定正確的 MIME 類型
    const contentType = 'image/jpeg'

    setHeader(event, 'Content-Type', contentType)
    // 添加ETag基於檔案修改時間，允許瀏覽器檢查是否有更新
    setHeader(event, 'Cache-Control', 'public, max-age=300, must-revalidate') // 快取 5 分鐘但必須重新驗證
    
    // 為了確保背景更新能立即看到，添加時間戳參數支持
    const query = getQuery(event)
    if (query.t || query.v) {
      // 如果有時間戳或版本參數，強制重新載入
      setHeader(event, 'Cache-Control', 'no-cache, no-store, must-revalidate')
      setHeader(event, 'Pragma', 'no-cache')
      setHeader(event, 'Expires', '0')
    }
    
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