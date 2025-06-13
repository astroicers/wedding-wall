import formidable from 'formidable'
import { MinioService } from '~/server/utils/minio'
import { readFile } from 'fs/promises'
import { randomUUID } from 'crypto'

export default defineEventHandler(async (event) => {
  try {
    const form = formidable({ keepExtensions: true, multiples: false })

    const { fields, files } = await new Promise<any>((resolve, reject) => {
      form.parse(event.node.req, (err, fields, files) => {
        if (err) return reject(err)
        if (!files.file) return reject(new Error('沒有檔案被上傳'))
        resolve({ fields, files })
      })
    })

    const file = files.file[0]
    const name = fields.name?.[0] || '匿名'
    const text = fields.text?.[0] || ''

    if (!file.originalFilename) {
      throw createError({
        statusCode: 400,
        statusMessage: '檔案名稱無效'
      })
    }

    // 檢查祝福內容長度
    if (!text.trim()) {
      throw createError({
        statusCode: 400,
        statusMessage: '請輸入祝福內容'
      })
    }

    if (text.length > 50) {
      throw createError({
        statusCode: 400,
        statusMessage: '祝福內容不能超過50字'
      })
    }

    // 檢查檔案類型
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
    if (!allowedTypes.includes(file.mimetype)) {
      throw createError({
        statusCode: 400,
        statusMessage: '只允許上傳圖片檔案'
      })
    }

    const fileBuffer = await readFile(file.filepath)
    const filename = `${Date.now()}-${file.originalFilename}`

    // 確保 bucket 存在
    await MinioService.ensureBucket('wedding-wall')

    // 上傳圖片
    await MinioService.uploadFile(filename, fileBuffer, file.mimetype)

    // 準備 metadata
    const metadata = {
      name,
      text,
      photo: `/api/image/${encodeURIComponent(filename)}`,
      timestamp: new Date().toISOString(),
      approved: 'pending' // 新上傳的留言預設為待審核狀態
    }

    // 上傳 metadata
    const metadataFilename = `metadata/${Date.now()}-${randomUUID()}.json`
    await MinioService.uploadJson(metadataFilename, metadata)

    return {
      success: true,
      url: metadata.photo,
      message: '上傳成功'
    }
  } catch (error: any) {
    console.error('上傳錯誤:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: '上傳失敗，請重試'
    })
  }
})
