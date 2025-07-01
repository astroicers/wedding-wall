import JSZip from 'jszip'
import { MinioService, BUCKET_NAME } from '~/server/utils/minio'

export default defineEventHandler(async (event) => {
  try {
    console.log('Export approved images API called')

    // 獲取所有元數據文件
    const metadataList = await MinioService.listFiles('metadata/')
    const jsonFiles = metadataList.filter(obj => obj.name && obj.name.endsWith('.json'))

    console.log(`Found ${jsonFiles.length} metadata files`)

    // 獲取核准的留言及其圖片路徑
    const approvedImagesData: { imagePath: string; name: string; timestamp: number }[] = []

    for (const obj of jsonFiles) {
      try {
        const stream = await MinioService.getFile(obj.name!)
        let jsonStr = ''
        
        for await (const chunk of stream) {
          jsonStr += chunk.toString()
        }

        const messageData = JSON.parse(jsonStr)
        
        console.log(`Processing metadata: ${obj.name}, approved: ${messageData.approved}, hasPhoto: ${!!messageData.photo}`)
        
        // 只包含已核准且有照片的留言
        if (messageData.approved === 'approved' && messageData.photo) {
          // 從完整 URL 中提取文件路徑
          let imagePath = messageData.photo
          
          // 如果是完整 URL，提取文件路徑
          if (imagePath.startsWith('http') || imagePath.startsWith('/api/image/')) {
            const match = imagePath.match(/\/api\/image\/(.+)$/) || imagePath.match(/([^/]+\.(jpg|jpeg|png|gif|webp))$/i)
            if (match) {
              imagePath = match[1]
            }
          }
          
          // URL 解碼處理，防止編碼問題
          try {
            imagePath = decodeURIComponent(imagePath)
          } catch (e) {
            console.log(`URL decode failed for ${imagePath}, using original`)
          }
          
          approvedImagesData.push({
            imagePath: imagePath,
            name: messageData.name || '未知用戶',
            timestamp: messageData.timestamp || Date.now()
          })
        }
      } catch (parseError) {
        console.error(`解析 ${obj.name} 失敗:`, parseError)
      }
    }

    console.log(`Found ${approvedImagesData.length} approved images`)

    if (approvedImagesData.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: '沒有找到已核准的照片'
      })
    }

    // 創建 ZIP 檔案
    const zip = new JSZip()
    let successCount = 0
    let errorCount = 0

    // 按時間戳排序（最新的在前）
    approvedImagesData.sort((a, b) => b.timestamp - a.timestamp)

    // 獲取所有實際存在的圖片文件，用於交叉對照
    const allImageFiles = await MinioService.listFiles('')
    const existingImageNames = allImageFiles
      .filter(obj => obj.name && !obj.name.startsWith('metadata/'))
      .map(obj => obj.name!)

    console.log(`Found ${existingImageNames.length} existing image files in bucket`)

    for (let i = 0; i < approvedImagesData.length; i++) {
      const imageData = approvedImagesData[i]
      
      try {
        console.log(`Processing image ${i + 1}/${approvedImagesData.length}: ${imageData.imagePath}`)
        
        // 嘗試找到匹配的文件名
        let actualFileName = imageData.imagePath
        
        // 如果直接找不到，嘗試匹配存在的文件名
        if (!existingImageNames.includes(actualFileName)) {
          // 嘗試 URL 編碼版本
          const encodedName = encodeURIComponent(actualFileName)
          if (existingImageNames.includes(encodedName)) {
            actualFileName = encodedName
            console.log(`Found encoded version: ${encodedName}`)
          } else {
            // 嘗試部分匹配（基於時間戳和擴展名）
            const baseNameMatch = actualFileName.match(/^(\d+)-.+\.(.+)$/)
            if (baseNameMatch) {
              const [, timestamp, ext] = baseNameMatch
              const partialMatch = existingImageNames.find(name => 
                name.startsWith(timestamp) && name.endsWith(`.${ext}`)
              )
              if (partialMatch) {
                actualFileName = partialMatch
                console.log(`Found partial match: ${partialMatch}`)
              }
            }
          }
        }
        
        // 從 MinIO 獲取圖片
        const imageStream = await MinioService.getFile(actualFileName)
        
        // 將流轉換為 Buffer
        const chunks: Buffer[] = []
        for await (const chunk of imageStream) {
          chunks.push(chunk)
        }
        const imageBuffer = Buffer.concat(chunks)

        // 獲取文件擴展名
        const fileExtension = imageData.imagePath.split('.').pop() || 'jpg'
        
        // 生成文件名：序號_姓名_時間戳
        const sanitizedName = imageData.name.replace(/[<>:"/\\|?*]/g, '_')
        const timestamp = new Date(imageData.timestamp).toISOString().split('T')[0]
        const fileName = `${String(i + 1).padStart(3, '0')}_${sanitizedName}_${timestamp}.${fileExtension}`

        // 添加到 ZIP
        zip.file(fileName, imageBuffer)
        successCount++
        console.log(`Successfully added: ${fileName} (from ${actualFileName})`)

      } catch (imageError) {
        console.error(`處理圖片 ${imageData.imagePath} 失敗:`, imageError)
        errorCount++
      }
    }

    if (successCount === 0) {
      throw createError({
        statusCode: 500,
        statusMessage: '無法處理任何圖片檔案'
      })
    }

    // 添加說明文件
    const readmeContent = `婚禮祝福照片集
===============

匯出日期: ${new Date().toLocaleString('zh-TW')}
成功處理: ${successCount} 張照片
處理失敗: ${errorCount} 張照片
總計: ${approvedImagesData.length} 張已核准照片

文件命名格式: 序號_姓名_日期.副檔名

感謝所有親友的祝福！
`
    zip.file('README.txt', readmeContent)

    // 生成 ZIP 檔案
    const zipBuffer = await zip.generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: {
        level: 6
      }
    })

    // 生成文件名
    const currentDate = new Date().toISOString().split('T')[0]
    const fileName = `婚禮祝福照片_${currentDate}.zip`

    // 設置響應頭
    setHeader(event, 'Content-Type', 'application/zip')
    setHeader(event, 'Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`)
    setHeader(event, 'Content-Length', zipBuffer.length.toString())
    setHeader(event, 'Cache-Control', 'no-cache, no-store, must-revalidate')

    console.log(`Export completed: ${successCount} success, ${errorCount} errors`)

    // 返回 ZIP 檔案
    return zipBuffer

  } catch (error) {
    console.error('匯出 ZIP 失敗:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: '匯出圖片檔案失敗'
    })
  }
})