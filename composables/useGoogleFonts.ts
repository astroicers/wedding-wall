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

// 中文字體列表
const CHINESE_FONTS = [
  'Noto Sans TC', 'Noto Serif TC', 'cwTeXKai', 'cwTeXYen', 'cwTeXFangSong'
]

export const useGoogleFonts = () => {
  /**
   * 檢查是否為 Google Font
   */
  const isGoogleFont = (font: string): boolean => {
    return !SYSTEM_FONTS.includes(font)
  }

  /**
   * 獲取字體家族連同備用字體
   */
  const getFontFamilyWithFallback = (fontFamily: string): string => {
    if (!isGoogleFont(fontFamily)) {
      return fontFamily
    }
    
    // 為中文字體添加合適的備用字體
    const fallbacks = CHINESE_FONTS.includes(fontFamily) 
      ? "'Microsoft JhengHei', 'Noto Sans CJK TC', 'PingFang TC', 'Hiragino Sans GB', sans-serif"
      : 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif'
    
    return `'${fontFamily}', ${fallbacks}`
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
      'Noto Serif TC',
      'cwTeXKai',
      'cwTeXYen',
      'cwTeXFangSong'
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

  return {
    isGoogleFont,
    getFontFamilyWithFallback,
    loadGoogleFont,
    preloadCommonFonts,
    isFontLoaded,
    waitForFont
  }
}