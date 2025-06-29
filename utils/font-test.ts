/**
 * 字體測試工具
 * 用於測試和驗證 Google Fonts 載入狀況
 */

export interface FontTestResult {
  fontName: string
  isLoaded: boolean
  loadTime?: number
  error?: string
}

/**
 * 測試字體是否正確載入
 */
export const testFontLoading = async (fontName: string): Promise<FontTestResult> => {
  const startTime = Date.now()
  
  try {
    // 使用 Google Fonts 工具
    const { loadGoogleFont, waitForFont } = useGoogleFonts()
    
    // 載入字體
    loadGoogleFont(fontName)
    
    // 等待字體載入完成
    const isLoaded = await waitForFont(fontName, 5000)
    const loadTime = Date.now() - startTime
    
    return {
      fontName,
      isLoaded,
      loadTime
    }
  } catch (error) {
    return {
      fontName,
      isLoaded: false,
      error: error instanceof Error ? error.message : String(error)
    }
  }
}

/**
 * 批量測試多個字體
 */
export const testMultipleFonts = async (fontNames: string[]): Promise<FontTestResult[]> => {
  const results = await Promise.all(
    fontNames.map(fontName => testFontLoading(fontName))
  )
  
  // 輸出測試結果到控制台
  console.group('Google Fonts Loading Test Results')
  results.forEach(result => {
    if (result.isLoaded) {
      console.log(`✅ ${result.fontName} - Loaded in ${result.loadTime}ms`)
    } else {
      console.error(`❌ ${result.fontName} - Failed to load`, result.error)
    }
  })
  console.groupEnd()
  
  return results
}

/**
 * 測試常用中文字體
 */
export const testChineseFonts = () => {
  const chineseFonts = [
    'Noto Sans TC',
    'Noto Serif TC',
    'cwTeXKai',
    'cwTeXYen',
    'cwTeXFangSong'
  ]
  
  return testMultipleFonts(chineseFonts)
}

/**
 * 測試常用英文字體
 */
export const testEnglishFonts = () => {
  const englishFonts: string[] = []
  
  return testMultipleFonts(englishFonts)
}

/**
 * 檢查瀏覽器字體 API 支援
 */
export const checkFontAPISupport = () => {
  const support = {
    fontFace: 'FontFace' in window,
    documentFonts: 'fonts' in document,
    fontLoad: document.fonts && typeof document.fonts.load === 'function',
    fontCheck: document.fonts && typeof document.fonts.check === 'function'
  }
  
  console.log('Font API Support:', support)
  return support
}