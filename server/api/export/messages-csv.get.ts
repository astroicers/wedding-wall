import { MinioService, BUCKET_NAME } from '~/server/utils/minio'

export default defineEventHandler(async (event) => {
  try {
    console.log('Export approved messages CSV API called')

    // 獲取所有元數據文件
    const metadataList = await MinioService.listFiles('metadata/')
    const jsonFiles = metadataList.filter(obj => obj.name && obj.name.endsWith('.json'))

    console.log(`Found ${jsonFiles.length} metadata files`)

    // 獲取核准的留言
    const approvedMessages: any[] = []

    for (const obj of jsonFiles) {
      try {
        const stream = await MinioService.getFile(obj.name!)
        let jsonStr = ''
        
        for await (const chunk of stream) {
          jsonStr += chunk.toString()
        }

        const messageData = JSON.parse(jsonStr)
        
        console.log(`Processing metadata: ${obj.name}, approved: ${messageData.approved}`)
        
        // 只包含已核准的留言
        if (messageData.approved === 'approved') {
          approvedMessages.push({
            姓名: messageData.name || '',
            留言內容: messageData.text || '',
            上傳時間: messageData.timestamp ? new Date(messageData.timestamp).toLocaleString('zh-TW') : '',
            審核時間: messageData.moderatedAt || ''
          })
        }
      } catch (parseError) {
        console.error(`解析 ${obj.name} 失敗:`, parseError)
      }
    }

    console.log(`Found ${approvedMessages.length} approved messages`)

    // 按時間戳排序（最新的在前）
    approvedMessages.sort((a, b) => {
      const timeA = new Date(a.上傳時間).getTime()
      const timeB = new Date(b.上傳時間).getTime()
      return timeB - timeA
    })

    // 生成 CSV 內容
    const csvHeader = '姓名,留言內容,上傳時間,審核時間\n'
    const csvRows = approvedMessages.map(msg => {
      // 處理包含逗號和雙引號的字段
      const escapeCsvField = (field: string) => {
        if (field.includes(',') || field.includes('"') || field.includes('\n')) {
          return `"${field.replace(/"/g, '""')}"`
        }
        return field
      }

      return [
        escapeCsvField(msg.姓名),
        escapeCsvField(msg.留言內容),
        escapeCsvField(msg.上傳時間),
        escapeCsvField(msg.審核時間)
      ].join(',')
    }).join('\n')

    const csvContent = csvHeader + csvRows

    // 生成文件名
    const currentDate = new Date().toISOString().split('T')[0]
    const fileName = `祝福留言_${currentDate}.csv`

    // 設置響應頭
    setHeader(event, 'Content-Type', 'text/csv; charset=utf-8')
    setHeader(event, 'Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`)
    setHeader(event, 'Cache-Control', 'no-cache, no-store, must-revalidate')

    // 添加 BOM 以確保 Excel 正確顯示中文
    return '\uFEFF' + csvContent

  } catch (error) {
    console.error('匯出 CSV 失敗:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '匯出 CSV 檔案失敗'
    })
  }
})