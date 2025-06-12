import { MinioService } from '~/server/utils/minio'
import { streamToBuffer } from '~/server/utils/stream'

export default defineEventHandler(async () => {
  try {
    const metadataFiles = await MinioService.listFiles('metadata/')
    
    if (metadataFiles.length === 0) {
      return []
    }

    const messages = []
    for (const obj of metadataFiles) {
      try {
        const stream = await MinioService.getFile(obj.name)
        const buffer = await streamToBuffer(stream)
        const data = JSON.parse(buffer.toString())
        messages.push(data)
      } catch (error) {
        console.error(`讀取 ${obj.name} 失敗:`, error)
        // 繼續處理其他檔案，不中斷整個請求
        continue
      }
    }

    // 按照時間戳排序（最新在後）
    messages.sort((a, b) => {
      const timeA = a.timestamp || a.photo || ''
      const timeB = b.timestamp || b.photo || ''
      return timeA.localeCompare(timeB)
    })

    return messages
  } catch (error) {
    console.error('取得 metadata 失敗:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '載入訊息失敗'
    })
  }
})