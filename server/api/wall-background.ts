import formidable from 'formidable'
import { readFileSync } from 'fs'
import { MinioService } from '~/server/utils/minio'

export default defineEventHandler(async (event) => {
  const method = event.node.req.method

  // 設定禁止快取的 HTTP 標頭，解決 Chromium 瀏覽器快取問題
  setHeader(event, 'Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0')
  setHeader(event, 'Pragma', 'no-cache')
  setHeader(event, 'Expires', '0')
  
  if (method === 'GET') {
    return await handleGet()
  } else if (method === 'POST') {
    return await handlePost(event)
  } else if (method === 'DELETE') {
    return await handleDelete()
  }

  throw createError({
    statusCode: 405,
    statusMessage: 'Method Not Allowed'
  })
})

async function handleGet() {
  try {
    const bucketName = 'wedding-background'
    
    // 確保 bucket 存在
    await MinioService.ensureBucket(bucketName)
    
    // 尋找最新的背景圖片（按檔名中的時間戳排序）
    try {
      const objects = await MinioService.listObjects(bucketName, 'background-')
      
      if (objects.length === 0) {
        return {
          success: true,
          backgroundUrl: null
        }
      }
      
      // 按檔案名排序，取最新的（時間戳最大的）
      const latestObject = objects.sort((a, b) => {
        const timestampA = parseInt(a.name.match(/background-(\d+)\./)?.[1] || '0')
        const timestampB = parseInt(b.name.match(/background-(\d+)\./)?.[1] || '0')
        return timestampB - timestampA
      })[0]
      
      // 返回 MinIO presigned URL
      const backgroundUrl = await MinioService.getPresignedUrl(bucketName, latestObject.name, 7 * 24 * 60 * 60)
      
      return {
        success: true,
        backgroundUrl
      }
    } catch (error: any) {
      // bucket 不存在或其他錯誤
      if (error.code === 'NoSuchBucket' || error.code === 'NoSuchKey') {
        return {
          success: true,
          backgroundUrl: null
        }
      }
      throw error
    }
  } catch (error) {
    console.error('載入背景圖片失敗:', error)
    return {
      success: false,
      error: '載入背景圖片失敗'
    }
  }
}

async function handlePost(event: any) {
  try {
    const bucketName = 'wedding-background'
    
    // 確保 bucket 存在（在檢查現有對象之前）
    await MinioService.ensureBucket(bucketName)
    
    // 檢查是否已有背景圖片
    const existingObjects = await MinioService.listObjects(bucketName, 'background-')
    if (existingObjects.length > 0) {
      throw createError({
        statusCode: 409, // Conflict
        statusMessage: '已有背景圖片存在，請先移除舊背景才能上傳新背景'
      })
    }

    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB
      uploadDir: '/tmp',
      keepExtensions: true
    })

    const [fields, files] = await form.parse(event.node.req)
    const backgroundFile = Array.isArray(files.background) ? files.background[0] : files.background

    if (!backgroundFile) {
      throw createError({
        statusCode: 400,
        statusMessage: '請選擇背景圖片檔案'
      })
    }

    // 驗證檔案類型
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(backgroundFile.mimetype || '')) {
      throw createError({
        statusCode: 400,
        statusMessage: '僅支援 JPG、PNG、WebP 格式的圖片'
      })
    }

    // 讀取檔案內容
    const fileBuffer = readFileSync(backgroundFile.filepath)
    
    // 使用時間戳檔名，確保每次上傳都是唯一檔案
    const timestamp = Date.now()
    const fileExtension = backgroundFile.originalFilename?.split('.').pop() || 'jpg'
    const fileName = `background-${timestamp}.${fileExtension}`
    
    // 上傳新的背景圖片（由於前面已檢查無舊檔案，直接上傳）
    await MinioService.uploadFile(fileName, fileBuffer, backgroundFile.mimetype || 'image/jpeg', bucketName)
    console.log(`新背景檔案已上傳: ${fileName}`)

    // 返回 MinIO presigned URL，有效期 7 天
    const backgroundUrl = await MinioService.getPresignedUrl(bucketName, fileName, 7 * 24 * 60 * 60)

    return {
      success: true,
      message: '背景圖片上傳成功',
      backgroundUrl,
      fileName
    }

  } catch (error: any) {
    console.error('上傳背景圖片失敗:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || '上傳背景圖片失敗'
    })
  }
}

async function handleDelete() {
  try {
    const bucketName = 'wedding-background'
    
    // 確保 bucket 存在
    await MinioService.ensureBucket(bucketName)
    
    // 刪除所有背景圖片
    try {
      const objects = await MinioService.listObjects(bucketName, 'background-')
      
      if (objects.length === 0) {
        return {
          success: true,
          message: '沒有背景圖片需要刪除'
        }
      }
      
      for (const obj of objects) {
        console.log(`正在刪除背景檔案: ${obj.name}`)
        await MinioService.deleteObject(bucketName, obj.name)
      }
      
      console.log('所有背景檔案清除完成，快取將被重置')
      
      return {
        success: true,
        message: `已成功移除 ${objects.length} 個背景圖片`,
        cacheCleared: true
      }
    } catch (error: any) {
      // bucket 不存在
      if (error.code === 'NoSuchBucket') {
        return {
          success: true,
          message: '沒有背景圖片需要刪除'
        }
      }
      throw error
    }

  } catch (error: any) {
    console.error('刪除背景圖片失敗:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '刪除背景圖片失敗'
    })
  }
}