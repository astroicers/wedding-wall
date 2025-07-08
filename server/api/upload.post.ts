import formidable from 'formidable'
import { MinioService } from '~/server/utils/minio'
import { readFile } from 'fs/promises'
import { randomUUID } from 'crypto'
import { Client } from 'minio'

export default defineEventHandler(async (event) => {
  try {
    // 檢查認證狀態
    const authContext = event.context.auth
    if (!authContext?.isAuthenticated) {
      throw createError({
        statusCode: 401,
        statusMessage: '需要登入才能上傳'
      })
    }
    
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
    const wallId = fields.wallId?.[0] || ''

    // 檢查 wallId 是否存在（多租戶支持）
    if (!wallId.trim()) {
      throw createError({
        statusCode: 400,
        statusMessage: '缺少祝福牆 ID'
      })
    }
    
    // 驗證用戶是否有權限上傳到這個牆
    const userId = authContext.userId
    try {
      const minioClient = new Client({
        endPoint: 'minio',
        port: 9000,
        useSSL: false,
        accessKey: 'admin',
        secretKey: 'admin123'
      })
      
      const wallMetadataPath = `users/${userId}/walls/${wallId}/metadata.json`
      await minioClient.statObject('wedding-wall', wallMetadataPath)
    } catch (error) {
      throw createError({
        statusCode: 403,
        statusMessage: '無權上傳到此祝福牆'
      })
    }

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
    const timestamp = Date.now()
    const filename = `${timestamp}-${file.originalFilename}`

    // 確保 bucket 存在
    await MinioService.ensureBucket('wedding-wall')

    // 上傳圖片
    await MinioService.uploadFile(filename, fileBuffer, file.mimetype)

    // 獲取墻設定以決定審核狀態
    const approvalStatus = await determineApprovalStatus(text, userId, wallId)
    
    // 準備 metadata（包含wallId）
    const metadata = {
      id: `${timestamp}-${randomUUID()}`,
      name,
      message: text, // 改為 message 以符合前端期望
      imagePath: filename, // 直接存儲文件名
      wallId,
      createdAt: timestamp,
      approved: approvalStatus
    }

    // 上傳 metadata（使用userId和wallId組織文件）
    const metadataFilename = `users/${userId}/walls/${wallId}/messages/${metadata.id}.json`
    await MinioService.uploadJson(metadataFilename, metadata)

    return {
      success: true,
      message: '上傳成功',
      data: {
        id: metadata.id,
        imagePath: metadata.imagePath,
        wallId: metadata.wallId,
        approved: metadata.approved
      }
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

// 根據墻設定決定審核狀態
async function determineApprovalStatus(text: string, userId: string, wallId: string): Promise<'approved' | 'pending' | 'rejected'> {
  try {
    // 獲取墻設定
    const settings = await getWallSettings(userId, wallId) as any
    
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
    
    // 檢查墻的自動審核設定
    if (settings.autoApprove) {
      console.log(`墻 ${wallId} 自動審核已啟用，留言自動通過:`, text)
      return 'approved'
    }
    
    // 預設為自動通過（對用戶友好）
    console.log(`墻 ${wallId} 沒有特殊設定，留言自動通過:`, text)
    return 'approved'
    
  } catch (error) {
    console.error('獲取審核設定失敗，使用預設自動通過狀態:', error)
    return 'approved'
  }
}

// 獲取墻設定
async function getWallSettings(userId: string, wallId: string) {
  try {
    const minioClient = new Client({
      endPoint: 'minio',
      port: 9000,
      useSSL: false,
      accessKey: 'admin',
      secretKey: 'admin123'
    })

    const bucketName = 'wedding-wall'
    // 從墻的 metadata 中獲取設定
    const metadataKey = `users/${userId}/walls/${wallId}/metadata.json`

    const stream = await minioClient.getObject(bucketName, metadataKey)
    
    return new Promise((resolve) => {
      let metadataData = ''
      
      stream.on('data', (chunk) => {
        metadataData += chunk.toString()
      })
      
      stream.on('end', () => {
        try {
          const metadata = JSON.parse(metadataData)
          // 返回墻的設定，如果沒有設定則使用預設值
          resolve(metadata.settings || getDefaultWallSettings())
        } catch (error) {
          resolve(getDefaultWallSettings())
        }
      })
      
      stream.on('error', () => {
        resolve(getDefaultWallSettings())
      })
    })
  } catch (error) {
    return getDefaultWallSettings()
  }
}

function getDefaultWallSettings() {
  return {
    displayMode: 'grid',
    autoApprove: true, // 預設自動通過，對用戶友好
    showUnmoderated: false,
    autoApproveKeywords: '',
    autoRejectKeywords: '',
    // 其他墻設定
    fontFamily: 'default',
    backgroundColor: '#ffffff',
    textColor: '#333333'
  }
}
