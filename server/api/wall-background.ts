import formidable from 'formidable'
import { readFileSync } from 'fs'
import { MinioService } from '~/server/utils/minio'

export default defineEventHandler(async (event) => {
  const method = event.node.req.method

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
    
    // 檢查是否存在背景圖片
    const objects = await MinioService.listObjects(bucketName, 'background.')
    
    if (objects.length > 0) {
      // 返回我們自己的背景圖片代理 URL
      const backgroundUrl = '/api/background-image'
      return {
        success: true,
        backgroundUrl
      }
    }
    
    return {
      success: true,
      backgroundUrl: null
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

    const bucketName = 'wedding-background'
    
    // 確保 bucket 存在
    await MinioService.ensureBucket(bucketName)

    // 清除舊的背景圖片
    try {
      const oldObjects = await MinioService.listObjects(bucketName, 'background.')
      for (const obj of oldObjects) {
        await MinioService.deleteObject(bucketName, obj.name)
      }
    } catch (error) {
      console.log('清除舊背景圖片時出錯:', error)
    }

    // 讀取檔案內容
    const fileBuffer = readFileSync(backgroundFile.filepath)
    
    // 生成新的檔案名稱
    const fileExtension = backgroundFile.originalFilename?.split('.').pop() || 'jpg'
    const fileName = `background.${fileExtension}`

    // 上傳新的背景圖片
    await MinioService.uploadFile(fileName, fileBuffer, backgroundFile.mimetype || 'image/jpeg', bucketName)

    // 返回我們自己的背景圖片代理 URL
    const backgroundUrl = '/api/background-image'

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
    
    // 獲取所有背景圖片
    const objects = await MinioService.listObjects(bucketName, 'background.')
    
    if (objects.length === 0) {
      return {
        success: true,
        message: '沒有背景圖片需要刪除'
      }
    }

    // 刪除所有背景圖片
    for (const obj of objects) {
      await MinioService.deleteObject(bucketName, obj.name)
    }

    return {
      success: true,
      message: '背景圖片已成功移除'
    }

  } catch (error: any) {
    console.error('刪除背景圖片失敗:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '刪除背景圖片失敗'
    })
  }
}