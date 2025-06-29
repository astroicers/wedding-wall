/**
 * 獲取自定義字體列表
 * 從 MinIO custom-fonts bucket 中獲取所有字體檔案
 */
import { createMinioClient } from '~/server/utils/minio'

export default defineEventHandler(async (event) => {
  try {
    const minioClient = createMinioClient()
    const bucketName = 'custom-fonts'
    
    // 檢查 bucket 是否存在
    const bucketExists = await minioClient.bucketExists(bucketName)
    if (!bucketExists) {
      return {
        success: true,
        fonts: []
      }
    }
    
    // 獲取所有字體檔案
    const stream = minioClient.listObjects(bucketName, '', true)
    const fonts: Array<{ name: string, displayName: string, filename: string }> = []
    
    for await (const obj of stream) {
      if (obj.name && obj.name.match(/\.(ttf|otf|woff|woff2)$/i)) {
        // 從檔案名稱生成顯示名稱 (去除副檔名)
        const displayName = obj.name.replace(/\.(ttf|otf|woff|woff2)$/i, '')
        const fontName = displayName.replace(/[-_]/g, '') // 移除連字符和底線作為 CSS font-family 名稱
        
        fonts.push({
          name: fontName,
          displayName: displayName,
          filename: obj.name
        })
      }
    }
    
    return {
      success: true,
      fonts: fonts.sort((a, b) => a.displayName.localeCompare(b.displayName))
    }
    
  } catch (error) {
    console.error('獲取自定義字體列表失敗:', error)
    return {
      success: false,
      error: '獲取字體列表失敗',
      fonts: []
    }
  }
})