/**
 * Google Fonts 載入工具
 * 統一管理 Google Fonts 的載入和字體應用邏輯
 */

// 系統字體列表
const SYSTEM_FONTS = [
  'system-ui, -apple-system, sans-serif',
  'Microsoft JhengHei, sans-serif',
  'Noto Sans TC, sans-serif',
  'DFKai-SB, serif',
  'PMingLiU, serif',
  'Arial, sans-serif',
  'Times New Roman, serif',
  'Georgia, serif'
]

// Google Fonts 標準中文字體列表
const CHINESE_FONTS = [
  'Noto Sans TC', 'Noto Serif TC'
]

// Google Fonts Early Access 字體列表
const EARLY_ACCESS_FONTS = [
  'cwTeXKai', 'cwTeXYen', 'cwTeXFangSong'
]

// 自定義字體列表 (動態從 MinIO 載入)
const CUSTOM_FONTS: string[] = []

export const useGoogleFonts = () => {
  // 動態載入的自定義字體
  const customFonts = ref<Array<{ name: string, displayName: string, filename: string }>>([])
  
  /**
   * 從 MinIO 獲取自定義字體列表
   */
  const loadCustomFontsList = async () => {
    try {
      const response = await $fetch('/api/custom-fonts/list')
      if (response.success) {
        customFonts.value = response.fonts
        // 更新 CUSTOM_FONTS 陣列
        CUSTOM_FONTS.length = 0
        CUSTOM_FONTS.push(...response.fonts.map(f => f.name))
      }
    } catch (error) {
      console.error('載入自定義字體列表失敗:', error)
    }
  }
  /**
   * 檢查是否為 Google Font
   */
  const isGoogleFont = (font: string): boolean => {
    // 明確檢查是否為標準 Google Fonts
    return CHINESE_FONTS.includes(font)
  }

  /**
   * 檢查是否為 Early Access 字體
   */
  const isEarlyAccessFont = (font: string): boolean => {
    return EARLY_ACCESS_FONTS.includes(font)
  }

  /**
   * 檢查是否為自定義字體
   */
  const isCustomFont = (font: string): boolean => {
    return CUSTOM_FONTS.includes(font)
  }

  /**
   * 獲取字體家族連同備用字體
   */
  const getFontFamilyWithFallback = (fontFamily: string): string => {
    if (!isGoogleFont(fontFamily) && !isCustomFont(fontFamily) && !isEarlyAccessFont(fontFamily)) {
      return fontFamily
    }
    
    // 為中文字體添加合適的備用字體
    const fallbacks = (CHINESE_FONTS.includes(fontFamily) || CUSTOM_FONTS.includes(fontFamily) || EARLY_ACCESS_FONTS.includes(fontFamily))
      ? "'Microsoft JhengHei', 'Noto Sans CJK TC', 'PingFang TC', 'Hiragino Sans GB', sans-serif"
      : 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif'
    
    return `'${fontFamily}', ${fallbacks}`
  }

  /**
   * 嘗試載入替代名稱的字體
   */
  const tryAlternativeNames = (originalName: string): void => {
    const alternatives = [
      originalName.replace(/[-_]/g, ''),           // 移除連字符和底線
      originalName.replace(/[-_]/g, '').toLowerCase(), // 小寫版本
      originalName.toLowerCase(),                   // 原始小寫
      originalName.replace(/\d+/g, ''),            // 移除數字
      originalName.replace(/[.\d]+/g, ''),         // 移除版本號
    ]
    
    console.log(`嘗試替代名稱:`, alternatives)
    
    // 嘗試第一個替代名稱
    if (alternatives.length > 1) {
      const altName = alternatives[1]
      console.log(`嘗試替代名稱: ${altName}`)
      
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = `/api/custom-fonts/${altName}.css`
      link.setAttribute('data-custom-font', 'true')
      
      link.onerror = () => {
        console.warn(`All alternative names failed for: ${originalName}`)
      }
      
      link.onload = () => {
        console.log(`Custom Font loaded with alternative name: ${altName}`)
      }
      
      document.head.appendChild(link)
    }
  }

  /**
   * 載入自定義字體
   */
  const loadCustomFont = (fontName: string): void => {
    try {
      // 移除現有的自定義字體 link
      const existingLink = document.querySelector('link[data-custom-font="true"]')
      if (existingLink) {
        existingLink.remove()
      }
      
      // 找到對應的字體檔案 - 支援多種匹配方式
      const fontInfo = customFonts.value.find(f => 
        f.name === fontName || 
        f.displayName === fontName ||
        f.filename.includes(fontName) ||
        f.filename.replace(/\.(ttf|otf|woff|woff2)$/i, '') === fontName
      )
      
      if (!fontInfo) {
        console.warn(`Custom font not found in list: ${fontName}`)
        console.log(`可用的自定義字體:`, customFonts.value.map(f => `${f.name} (${f.displayName}) [${f.filename}]`))
        
        // 如果找不到字體，嘗試直接使用 fontName 作為檔案名進行請求
        console.log(`嘗試直接載入字體: ${fontName}`)
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = `/api/custom-fonts/${fontName}.css`
        link.setAttribute('data-custom-font', 'true')
        
        link.onerror = () => {
          console.warn(`Failed to load Custom Font: ${fontName}`)
          // 嘗試其他可能的名稱變化
          tryAlternativeNames(fontName)
        }
        
        link.onload = () => {
          console.log(`Custom Font loaded successfully: ${fontName}`)
        }
        
        document.head.appendChild(link)
        return
      }
      
      // 創建新的 link 元素
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = `/api/custom-fonts/${fontInfo.filename.replace(/\.(ttf|otf|woff|woff2)$/i, '')}.css`
      link.setAttribute('data-custom-font', 'true')
      
      // 添加錯誤處理
      link.onerror = () => {
        console.warn(`Failed to load Custom Font: ${fontName}`)
      }
      
      // 添加載入成功監聽
      link.onload = () => {
        console.log(`Custom Font loaded successfully: ${fontName}`)
      }
      
      document.head.appendChild(link)
    } catch (error) {
      console.error('Error loading Custom Font:', error)
    }
  }

  /**
   * 載入 Early Access 字體
   */
  const loadEarlyAccessFont = (fontName: string): void => {
    if (!isEarlyAccessFont(fontName)) return
    
    try {
      // 移除現有的 Early Access 字體 link
      const existingLink = document.querySelector('link[data-early-access-font="true"]')
      if (existingLink) {
        existingLink.remove()
      }
      
      // 創建新的 link 元素
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      
      // Early Access 字體的 URL 格式
      const fontUrlMap: Record<string, string> = {
        'cwTeXKai': 'https://fonts.googleapis.com/earlyaccess/cwtexkai.css',
        'cwTeXYen': 'https://fonts.googleapis.com/earlyaccess/cwtexyen.css',
        'cwTeXFangSong': 'https://fonts.googleapis.com/earlyaccess/cwtexfangsong.css'
      }
      
      link.href = fontUrlMap[fontName]
      link.setAttribute('data-early-access-font', 'true')
      
      // 添加錯誤處理
      link.onerror = () => {
        console.warn(`Failed to load Early Access Font: ${fontName}`)
      }
      
      // 添加載入成功監聽
      link.onload = () => {
        console.log(`Early Access Font loaded successfully: ${fontName}`)
      }
      
      document.head.appendChild(link)
    } catch (error) {
      console.error('Error loading Early Access Font:', error)
    }
  }

  /**
   * 載入 Google Font
   */
  const loadGoogleFont = (fontName: string): void => {
    if (!isGoogleFont(fontName)) return
    
    try {
      // 移除現有的 Google Fonts link
      const existingLink = document.querySelector('link[data-google-font="true"]')
      if (existingLink) {
        existingLink.remove()
      }
      
      // 創建新的 link 元素
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      
      // 正確處理字體名稱中的所有空格和特殊字符
      const encodedFontName = fontName.replace(/\s+/g, '+')
      link.href = `https://fonts.googleapis.com/css2?family=${encodedFontName}:wght@400;500;600;700&display=swap`
      link.setAttribute('data-google-font', 'true')
      
      // 添加錯誤處理
      link.onerror = () => {
        console.warn(`Failed to load Google Font: ${fontName}`)
      }
      
      // 添加載入成功監聽
      link.onload = () => {
        console.log(`Google Font loaded successfully: ${fontName}`)
      }
      
      document.head.appendChild(link)
    } catch (error) {
      console.error('Error loading Google Font:', error)
    }
  }

  /**
   * 預載入常用的 Google Fonts
   */
  const preloadCommonFonts = (): void => {
    const commonFonts = [
      'Noto Sans TC',
      'Noto Serif TC'
    ]
    
    commonFonts.forEach(font => {
      // 檢查是否已經載入過
      const encodedFont = font.replace(/\s+/g, '+')
      const existing = document.querySelector(`link[href*="${encodedFont}"]`)
      if (existing) return
      
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = `https://fonts.googleapis.com/css2?family=${encodedFont}:wght@400;500;600;700&display=swap`
      link.setAttribute('data-preloaded-font', font)
      
      link.onload = () => {
        console.log(`Preloaded font: ${font}`)
      }
      
      link.onerror = () => {
        console.warn(`Failed to preload font: ${font}`)
      }
      
      document.head.appendChild(link)
    })
  }

  /**
   * 檢查字體是否已載入
   */
  const isFontLoaded = (fontName: string): boolean => {
    try {
      return document.fonts.check(`12px "${fontName}"`)
    } catch (error) {
      console.warn('Font check not supported:', error)
      return false
    }
  }

  /**
   * 等待字體載入完成
   */
  const waitForFont = (fontName: string, timeout = 3000): Promise<boolean> => {
    return new Promise((resolve) => {
      if (isFontLoaded(fontName)) {
        resolve(true)
        return
      }

      const startTime = Date.now()
      const checkFont = () => {
        if (isFontLoaded(fontName)) {
          resolve(true)
        } else if (Date.now() - startTime > timeout) {
          console.warn(`Font loading timeout: ${fontName}`)
          resolve(false)
        } else {
          setTimeout(checkFont, 100)
        }
      }

      checkFont()
    })
  }

  /**
   * 載入字體（自動判斷類型）
   */
  const loadFont = async (fontName: string): Promise<void> => {
    // 跳過系統字體
    if (SYSTEM_FONTS.some(sf => sf.includes(fontName))) {
      return
    }
    
    // 優先檢查是否為明確的字體類型
    if (isEarlyAccessFont(fontName)) {
      loadEarlyAccessFont(fontName)
      return
    }
    
    if (isGoogleFont(fontName)) {
      loadGoogleFont(fontName)
      return
    }
    
    // 如果 customFonts 列表為空，先嘗試載入
    if (customFonts.value.length === 0) {
      console.log('自定義字體列表為空，嘗試載入...')
      await loadCustomFontsList()
    }
    
    // 檢查是否為自定義字體（在 CUSTOM_FONTS 陣列中）
    if (isCustomFont(fontName)) {
      loadCustomFont(fontName)
      return
    }
    
    // 如果不在 CUSTOM_FONTS 陣列中，嘗試在 customFonts 詳細列表中查找匹配
    const matchedFont = customFonts.value.find(font => 
      font.name === fontName || 
      font.displayName === fontName ||
      font.filename.includes(fontName) ||
      font.filename.replace(/\.(ttf|otf|woff|woff2)$/i, '') === fontName
    )
    
    if (matchedFont) {
      console.log(`找到匹配的自定義字體: ${fontName} -> ${matchedFont.name}`)
      loadCustomFont(matchedFont.name)
    } else {
      // 最後嘗試直接作為自定義字體載入
      console.log(`未知字體類型: ${fontName}，嘗試作為自定義字體載入`)
      loadCustomFont(fontName)
    }
  }

  return {
    isGoogleFont,
    isEarlyAccessFont,
    isCustomFont,
    getFontFamilyWithFallback,
    loadGoogleFont,
    loadEarlyAccessFont,
    loadCustomFont,
    loadFont,
    preloadCommonFonts,
    isFontLoaded,
    waitForFont,
    customFonts: readonly(customFonts),
    loadCustomFontsList
  }
}