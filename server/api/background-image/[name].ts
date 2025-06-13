import { MinioService } from '~/server/utils/minio'

export default defineEventHandler(async (event) => {
  try {
    const name = getRouterParam(event, 'name')
    
    if (!name) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Background image name is required'
      })
    }

    // 設定禁止快取的 HTTP 標頭
    setHeader(event, 'Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0')
    setHeader(event, 'Pragma', 'no-cache')
    setHeader(event, 'Expires', '0')

    // 從 wedding-background bucket 取得檔案
    const bucketName = 'wedding-background'
    const stream = await MinioService.getFile(name, bucketName)
    
    // 設定正確的 Content-Type
    if (name.endsWith('.png')) {
      setHeader(event, 'Content-Type', 'image/png')
    } else if (name.endsWith('.jpg') || name.endsWith('.jpeg')) {
      setHeader(event, 'Content-Type', 'image/jpeg')
    } else if (name.endsWith('.webp')) {
      setHeader(event, 'Content-Type', 'image/webp')
    }
    
    return stream
  } catch (error: any) {
    console.error('背景圖片載入失敗:', error)
    
    if (error.code === 'NoSuchKey' || error.code === 'NoSuchBucket') {
      throw createError({
        statusCode: 404,
        statusMessage: 'Background image not found'
      })
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to load background image'
    })
  }
})