import { MinioService } from '~/server/utils/minio'

export default defineEventHandler(async (event) => {
  try {
    const name = decodeURIComponent(event.context.params?.name || '')
    
    if (!name) {
      throw createError({ 
        statusCode: 400, 
        statusMessage: '圖片名稱無效' 
      })
    }

    // 安全檢查：防止路徑遍歷攻擊
    if (name.includes('..') || name.includes('/') || name.includes('\\')) {
      throw createError({ 
        statusCode: 400, 
        statusMessage: '圖片名稱包含無效字符' 
      })
    }

    const stream = await MinioService.getFile(name)

    // 更準確的 MIME 類型判斷
    const ext = name.split('.').pop()?.toLowerCase()
    const contentType = getContentType(ext)

    setHeader(event, 'Content-Type', contentType)
    setHeader(event, 'Cache-Control', 'public, max-age=31536000') // 快取一年
    
    return sendStream(event, stream)
  } catch (err: any) {
    console.error('[IMAGE] 取得圖片失敗:', err)
    
    if (err.code === 'NoSuchKey' || err.statusCode === 404) {
      throw createError({ 
        statusCode: 404, 
        statusMessage: '圖片不存在' 
      })
    }
    
    if (err.statusCode) {
      throw err
    }
    
    throw createError({ 
      statusCode: 500, 
      statusMessage: '取得圖片失敗' 
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
