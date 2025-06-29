/**
 * 自定義字體檔案服務
 * 從 MinIO custom-fonts bucket 中提供字體檔案
 */

import { createMinioClient } from '~/server/utils/minio'

export default defineEventHandler(async (event) => {
  const filename = getRouterParam(event, 'filename')
  
  if (!filename) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Filename is required'
    })
  }

  // 驗證檔案類型
  const allowedExtensions = ['.ttf', '.otf', '.woff', '.woff2']
  const hasValidExtension = allowedExtensions.some(ext => filename.toLowerCase().endsWith(ext))
  
  if (!hasValidExtension) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid font file type'
    })
  }

  try {
    const minio = createMinioClient()
    const bucketName = 'custom-fonts'
    
    // 檢查 bucket 是否存在，不存在則創建
    const bucketExists = await minio.bucketExists(bucketName)
    if (!bucketExists) {
      await minio.makeBucket(bucketName)
      console.log(`創建 MinIO bucket: ${bucketName}`)
    }
    
    // 檢查檔案是否存在
    try {
      await minio.statObject(bucketName, filename)
    } catch (error) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Font file not found'
      })
    }
    
    // 獲取檔案流
    const stream = await minio.getObject(bucketName, filename)
    
    // 設定適當的 headers
    const mimeTypes: Record<string, string> = {
      '.ttf': 'font/ttf',
      '.otf': 'font/otf',
      '.woff': 'font/woff',
      '.woff2': 'font/woff2'
    }
    
    const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'))
    const mimeType = mimeTypes[extension] || 'application/octet-stream'
    
    setHeader(event, 'Content-Type', mimeType)
    setHeader(event, 'Cache-Control', 'public, max-age=31536000') // 1年快取
    setHeader(event, 'Access-Control-Allow-Origin', '*') // 允許跨域字體載入
    
    return stream
  } catch (error) {
    console.error('自定義字體檔案服務錯誤:', error)
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to serve font file'
    })
  }
})