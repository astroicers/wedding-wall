<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup>
// 應用啟動時清除所有背景圖像的瀏覽器快取
onMounted(() => {
  // 延遲執行，確保 DOM 已完全載入
  nextTick(() => {
    // 清除所有可能的背景圖像快取
    const imgElements = document.querySelectorAll('img[src*="wedding-background"], img[src*="background-"], img[src*="localhost:9000"]')
    imgElements.forEach(img => {
      const imgEl = img
      if (imgEl.src && (imgEl.src.includes('wedding-background') || imgEl.src.includes('background-'))) {
        console.log('清除圖像快取:', imgEl.src)
        const originalSrc = imgEl.src
        imgEl.src = ''
        // 如果圖像仍然需要顯示，重新設定 src
        setTimeout(() => {
          if (imgEl.parentElement && originalSrc) {
            imgEl.src = originalSrc + (originalSrc.includes('?') ? '&' : '?') + 'v=' + Date.now()
          }
        }, 100)
      }
    })
  })
  
  // 監聽頁面載入完成事件
  window.addEventListener('load', () => {
    console.log('頁面載入完成，檢查並清除過期的背景圖像快取')
    // 再次清除快取
    const imgElements = document.querySelectorAll('img[src*="wedding-background"], img[src*="background-"]')
    imgElements.forEach(img => {
      const imgEl = img
      if (imgEl.complete && imgEl.naturalWidth === 0) {
        // 圖像載入失敗，清除 src
        imgEl.src = ''
        imgEl.style.display = 'none'
      }
    })
  })
})
</script>