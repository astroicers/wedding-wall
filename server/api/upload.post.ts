import formidable from 'formidable'
import { MinioService } from '~/server/utils/minio'
import { readFile } from 'fs/promises'
import { randomUUID } from 'crypto'
import { Client } from 'minio'

export default defineEventHandler(async (event) => {
  try {
    const form = formidable({ keepExtensions: true, multiples: false })

    const { fields, files } = await new Promise<any>((resolve, reject) => {
      form.parse(event.node.req, (err, fields, files) => {
        if (err) return reject(err)
        resolve({ fields, files })
      })
    })

    const file = files.file?.[0]
    const name = fields.name?.[0] || '匿名'
    const text = fields.text?.[0] || ''
    const uploadMode = fields.uploadMode?.[0] || 'image'

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

    let filename = null
    let photoUrl = null

    // 只有在圖片模式且有檔案時才處理圖片上傳
    if (uploadMode === 'image' && file) {
      if (!file.originalFilename) {
        throw createError({
          statusCode: 400,
          statusMessage: '檔案名稱無效'
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
      filename = `${Date.now()}-${file.originalFilename}`

      // 確保 bucket 存在
      await MinioService.ensureBucket('wedding-wall')

      // 上傳圖片
      await MinioService.uploadFile(filename, fileBuffer, file.mimetype)
      photoUrl = `/api/image/${encodeURIComponent(filename)}`
    } else if (uploadMode === 'image') {
      // 圖片模式但沒有檔案
      throw createError({
        statusCode: 400,
        statusMessage: '圖片模式需要選擇圖片'
      })
    } else {
      // 純文字模式，確保 bucket 存在
      await MinioService.ensureBucket('wedding-wall')
    }

    // 獲取管理員設定以決定審核狀態
    const approvalStatus = await determineApprovalStatus(text)
    
    // 準備 metadata
    const metadata = {
      name,
      text,
      photo: photoUrl, // 純文字模式時為 null
      timestamp: Date.now(),
      approved: approvalStatus,
      uploadMode // 記錄上傳模式
    }

    // 上傳 metadata
    const metadataFilename = `metadata/${Date.now()}-${randomUUID()}.json`
    await MinioService.uploadJson(metadataFilename, metadata)

    return {
      success: true,
      url: photoUrl,
      message: uploadMode === 'text' ? '純文字祝福上傳成功' : '上傳成功'
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

// 根據管理員設定決定審核狀態
async function determineApprovalStatus(text: string): Promise<'approved' | 'pending' | 'rejected'> {
  try {
    // 獲取管理員設定
    const settings = await getAdminSettings() as any
    
    // 檢查自動拒絕關鍵字
    if (settings.autoRejectKeywords) {
      const rejectKeywords = settings.autoRejectKeywords.split(',').map((k: string) => k.trim()).filter((k: string) => k)
      for (const keyword of rejectKeywords) {
        if (text.toLowerCase().includes(keyword.toLowerCase())) {
          console.log(`留言因包含拒絕關鍵字 "${keyword}" 被自動拒絕:`, text)
          return 'rejected'
        }
      }
    }
    
    // 檢查自動通過關鍵字
    if (settings.autoApproveKeywords) {
      const approveKeywords = settings.autoApproveKeywords.split(',').map((k: string) => k.trim()).filter((k: string) => k)
      for (const keyword of approveKeywords) {
        if (text.toLowerCase().includes(keyword.toLowerCase())) {
          console.log(`留言因包含通過關鍵字 "${keyword}" 被自動通過:`, text)
          return 'approved'
        }
      }
    }
    
    // 檢查全局自動審核設定
    if (settings.autoApprove) {
      console.log('全局自動審核已啟用，留言自動通過:', text)
      return 'approved'
    }
    
    // 預設為待審核
    console.log('留言待審核:', text)
    return 'pending'
    
  } catch (error) {
    console.error('獲取審核設定失敗，使用預設待審核狀態:', error)
    return 'pending'
  }
}

// 獲取管理員設定
async function getAdminSettings() {
  try {
    const minioClient = new Client({
      endPoint: 'minio',
      port: 9000,
      useSSL: false,
      accessKey: 'admin',
      secretKey: 'admin123'
    })

    const bucketName = 'wedding-wall'
    const settingsKey = 'admin-settings.json'

    const stream = await minioClient.getObject(bucketName, settingsKey)
    
    return new Promise((resolve) => {
      let settingsData = ''
      
      stream.on('data', (chunk) => {
        settingsData += chunk.toString()
      })
      
      stream.on('end', () => {
        try {
          const settings = JSON.parse(settingsData)
          resolve(settings)
        } catch (error) {
          resolve(getDefaultSettings())
        }
      })
      
      stream.on('error', () => {
        resolve(getDefaultSettings())
      })
    })
  } catch (error) {
    return getDefaultSettings()
  }
}

function getDefaultSettings() {
  return {
    autoApprove: false,
    showUnmoderated: false,
    autoApproveKeywords: '',
    autoRejectKeywords: ''
  }
}
