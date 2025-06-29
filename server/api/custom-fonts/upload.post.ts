/**
 * 自定義字體上傳 API
 * 將字體檔案上傳至 MinIO custom-fonts bucket
 */

import formidable from 'formidable'
import { createMinioClient } from '~/server/utils/minio'
import { createReadStream } from 'fs'

export default defineEventHandler(async (event) => {
  try {
    const minio = createMinioClient()
    const bucketName = 'custom-fonts'
    
    // 檢查 bucket 是否存在，不存在則創建
    const bucketExists = await minio.bucketExists(bucketName)
    if (!bucketExists) {
      await minio.makeBucket(bucketName)
      console.log(`創建 MinIO bucket: ${bucketName}`)
    }
    
    // 解析上傳的檔案
    const form = formidable({
      maxFileSize: 50 * 1024 * 1024, // 50MB 限制
      filter: ({ mimetype }) => {
        // 允許的字體檔案類型
        return mimetype?.includes('font') || 
               mimetype?.includes('truetype') || 
               mimetype?.includes('opentype') ||
               mimetype === 'application/octet-stream'
      }
    })

    const [fields, files] = await form.parse(event.node.req)
    
    if (!files.font || !files.font[0]) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No font file provided'
      })
    }

    const file = files.font[0]
    const originalName = file.originalFilename || 'font'
    
    // 驗證檔案副檔名
    const allowedExtensions = ['.ttf', '.otf', '.woff', '.woff2']
    const hasValidExtension = allowedExtensions.some(ext => 
      originalName.toLowerCase().endsWith(ext)
    )
    
    if (!hasValidExtension) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid font file format. Allowed: .ttf, .otf, .woff, .woff2'
      })
    }
    
    // 生成安全的檔案名
    const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_')
    const fileName = `${Date.now()}-${sanitizedName}`
    
    // 上傳到 MinIO
    const fileStream = createReadStream(file.filepath)
    await minio.putObject(bucketName, fileName, fileStream, file.size)
    
    console.log(`字體檔案上傳成功: ${fileName}`)
    
    return {
      success: true,
      fileName,
      originalName,
      size: file.size,
      url: `/api/custom-fonts/files/${fileName}`
    }
  } catch (error) {
    console.error('字體檔案上傳錯誤:', error)
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Font upload failed'
    })
  }
})