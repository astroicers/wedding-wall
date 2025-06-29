/**
 * 字體檔案上傳腳本
 * 用於將 TTF 字體檔案上傳到 MinIO custom-fonts bucket
 * 
 * 使用方式：
 * node scripts/upload-font.js <字體檔案路徑>
 * 
 * 例如：
 * node scripts/upload-font.js ./fonts/jf-openhuninn-2.0.ttf
 */

const { MinioClient } = require('minio')
const fs = require('fs')
const path = require('path')

// MinIO 配置
const MINIO_CONFIG = {
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: 9000,
  useSSL: false,
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin'
}

const BUCKET_NAME = 'custom-fonts'

async function uploadFont(fontFilePath) {
  try {
    // 檢查檔案是否存在
    if (!fs.existsSync(fontFilePath)) {
      console.error('❌ 字體檔案不存在:', fontFilePath)
      process.exit(1)
    }
    
    // 創建 MinIO 客戶端
    const minio = new MinioClient(MINIO_CONFIG)
    
    // 檢查並創建 bucket
    const bucketExists = await minio.bucketExists(BUCKET_NAME)
    if (!bucketExists) {
      await minio.makeBucket(BUCKET_NAME)
      console.log('✅ 創建 MinIO bucket:', BUCKET_NAME)
    }
    
    // 獲取檔案資訊
    const fileName = path.basename(fontFilePath)
    const fileStats = fs.statSync(fontFilePath)
    
    console.log('📤 開始上傳字體檔案...')
    console.log('   檔案名稱:', fileName)
    console.log('   檔案大小:', (fileStats.size / 1024 / 1024).toFixed(2), 'MB')
    
    // 上傳檔案
    await minio.fPutObject(BUCKET_NAME, fileName, fontFilePath)
    
    console.log('✅ 字體檔案上傳成功!')
    console.log('   存取路徑:', `/api/custom-fonts/files/${fileName}`)
    console.log('   CSS 路徑:', `/api/custom-fonts/${fileName.split('.')[0]}.css`)
    
  } catch (error) {
    console.error('❌ 字體檔案上傳失敗:', error.message)
    process.exit(1)
  }
}

// 主程序
const fontFilePath = process.argv[2]

if (!fontFilePath) {
  console.log('使用方式: node scripts/upload-font.js <字體檔案路徑>')
  console.log('例如: node scripts/upload-font.js ./fonts/jf-openhuninn-2.0.ttf')
  process.exit(1)
}

uploadFont(fontFilePath)