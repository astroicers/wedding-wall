/**
 * Google Fonts 客戶端插件
 * 預載入常用字體並處理字體載入相關設定
 */

export default defineNuxtPlugin(() => {
  // 只在客戶端執行
  if (process.client) {
    const { preloadCommonFonts } = useGoogleFonts()
    
    // 預載入常用字體
    nextTick(() => {
      preloadCommonFonts()
    })
    
    // 添加 DNS prefetch 以加快 Google Fonts 載入
    const dnsPrefetch = document.createElement('link')
    dnsPrefetch.rel = 'dns-prefetch'
    dnsPrefetch.href = 'https://fonts.googleapis.com'
    document.head.appendChild(dnsPrefetch)
    
    const preconnect1 = document.createElement('link')
    preconnect1.rel = 'preconnect'
    preconnect1.href = 'https://fonts.googleapis.com'
    document.head.appendChild(preconnect1)
    
    const preconnect2 = document.createElement('link')
    preconnect2.rel = 'preconnect'
    preconnect2.href = 'https://fonts.gstatic.com'
    preconnect2.crossOrigin = 'anonymous'
    document.head.appendChild(preconnect2)
    
    console.log('Google Fonts plugin initialized')
  }
})