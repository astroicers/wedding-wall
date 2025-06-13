import JSZip from 'jszip'
import { MinioService, BUCKET_NAME } from '~/server/utils/minio'

export default defineEventHandler(async (event) => {
  try {
    // 先返回一個測試訊息確保API路由正常
    console.log('Download all API called')
    
    // 獲取所有圖片檔案
    const allObjects = await MinioService.listFiles('')
    
    // 過濾出圖片檔案
    const imageObjects = allObjects.filter(obj => 
      obj.name && !obj.name.startsWith('metadata/') && 
      (obj.name.endsWith('.jpg') || obj.name.endsWith('.jpeg') || 
       obj.name.endsWith('.png') || obj.name.endsWith('.gif'))
    )

    if (imageObjects.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: '沒有找到任何圖片'
      })
    }

    // 創建 ZIP 檔案
    const zip = new JSZip()
    
    // 為每個圖片檔案添加到 ZIP
    for (const obj of imageObjects) {
      try {
        const stream = await MinioService.getFile(obj.name!)
        const chunks: Buffer[] = []
        
        for await (const chunk of stream) {
          chunks.push(chunk)
        }
        
        const buffer = Buffer.concat(chunks)
        // 使用原始檔名，如果重複則加上序號
        let fileName = obj.name!
        let counter = 1
        while (zip.files[fileName]) {
          const ext = fileName.split('.').pop()
          const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.'))
          fileName = `${nameWithoutExt}_${counter}.${ext}`
          counter++
        }
        
        zip.file(fileName, buffer)
      } catch (err) {
        console.error(`Failed to add ${obj.name} to zip:`, err)
      }
    }

    // 生成 ZIP buffer
    const zipBuffer = await zip.generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: {
        level: 6
      }
    })

    // 設定回應標頭
    setHeader(event, 'Content-Type', 'application/zip')
    setHeader(event, 'Content-Disposition', `attachment; filename="wedding-photos-${new Date().toISOString().split('T')[0]}.zip"`)
    setHeader(event, 'Content-Length', zipBuffer.length.toString())

    return zipBuffer
  } catch (error) {
    console.error('Download all photos error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '下載失敗，請稍後再試'
    })
  }
})