/**
 * 自定義字體 CSS 檔案服務
 * 為自定義字體生成 CSS @font-face 規則
 */
import { createMinioClient } from '~/server/utils/minio'

export default defineEventHandler(async (event) => {
  const fontName = getRouterParam(event, 'name')
  
  if (!fontName) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Font name is required'
    })
  }

  // 移除 .css 副檔名
  const cleanFontName = fontName.replace(/\.css$/, '')
  
  try {
    const minioClient = createMinioClient()
    const bucketName = 'custom-fonts'
    
    // 檢查 bucket 是否存在
    const bucketExists = await minioClient.bucketExists(bucketName)
    if (!bucketExists) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Custom fonts bucket not found'
      })
    }
    
    // 查找對應的字體檔案
    const stream = minioClient.listObjects(bucketName, '', true)
    let fontFile = null
    let actualFontName = cleanFontName
    
    // 收集所有檔案進行匹配
    const allFiles = []
    for await (const obj of stream) {
      if (obj.name && obj.name.match(/\.(ttf|otf|woff|woff2)$/i)) {
        allFiles.push(obj.name)
      }
    }
    
    console.log(`正在尋找字體: ${cleanFontName}`)
    console.log(`可用的字體檔案:`, allFiles)
    
    // 嘗試多種匹配方式
    for (const fileName of allFiles) {
      const fileBaseName = fileName.replace(/\.(ttf|otf|woff|woff2)$/i, '')
      const generatedFontName = fileBaseName.replace(/[-_]/g, '')
      const lowerCleanName = cleanFontName.toLowerCase()
      const lowerFileName = fileName.toLowerCase()
      const lowerBaseName = fileBaseName.toLowerCase()
      const lowerGeneratedName = generatedFontName.toLowerCase()
      
      // 多種匹配條件
      if (
        generatedFontName === cleanFontName ||           // 完全匹配生成的名稱
        fileBaseName === cleanFontName ||                // 完全匹配檔案基本名稱
        lowerGeneratedName === lowerCleanName ||         // 忽略大小寫匹配生成名稱
        lowerBaseName === lowerCleanName ||              // 忽略大小寫匹配基本名稱
        lowerFileName.includes(lowerCleanName) ||        // 檔案名稱包含搜尋名稱
        lowerCleanName.includes(lowerBaseName) ||        // 搜尋名稱包含檔案基本名稱
        lowerCleanName.includes(lowerGeneratedName)      // 搜尋名稱包含生成名稱
      ) {
        fontFile = fileName
        actualFontName = fileBaseName
        console.log(`找到匹配的字體檔案: ${fileName} -> ${actualFontName}`)
        break
      }
    }
    
    if (!fontFile) {
      // 如果找不到對應檔案，返回空 CSS
      setHeader(event, 'Content-Type', 'text/css')
      return `/* Font not found: ${cleanFontName} */`
    }
    
    // 判斷字體格式
    const extension = fontFile.split('.').pop()?.toLowerCase()
    let format = 'truetype'
    
    switch (extension) {
      case 'otf':
        format = 'opentype'
        break
      case 'woff':
        format = 'woff'
        break
      case 'woff2':
        format = 'woff2'
        break
      case 'ttf':
      default:
        format = 'truetype'
        break
    }
    
    // 生成 CSS
    const css = `
@font-face {
  font-family: '${actualFontName}';
  src: url('/api/custom-fonts/files/${fontFile}') format('${format}');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}
`.trim()
    
    // 設定適當的 headers
    setHeader(event, 'Content-Type', 'text/css')
    setHeader(event, 'Cache-Control', 'public, max-age=31536000') // 1年快取
    
    return css
  } catch (error) {
    console.error('自定義字體 CSS 生成錯誤:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to generate font CSS'
    })
  }
})