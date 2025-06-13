// 簡化的全局背景狀態管理
const backgroundUrl = ref<string>('')
const isLoading = ref(false)

export const useBackgroundStore = () => {
  const updateBackground = (url: string) => {
    // 為了解決 Chromium 瀏覽器快取問題，確保 URL 唯一性
    if (url && url.trim()) {
      // 如果 URL 沒有快取破壞參數，加入一個
      if (!url.includes('cb=')) {
        const separator = url.includes('?') ? '&' : '?'
        url += `${separator}cb=${Date.now()}`
      }
    }
    backgroundUrl.value = url || ''
    console.log('背景 URL 已更新:', url)
  }

  const getBackgroundUrl = () => {
    return backgroundUrl.value
  }

  const loadBackground = async (force = false) => {
    // 如果已經在載入中且不是強制載入，則跳過
    if (isLoading.value && !force) return
    
    isLoading.value = true
    try {
      // 強制重新從 MinIO 取得，避免快取
      const cacheBuster = force ? `?cb=${Date.now()}` : ''
      const response = await fetch(`/api/wall-background${cacheBuster}`)
      
      if (response.ok) {
        const data = await response.json()
        
        // 如果 MinIO 中沒有背景圖，強制清空
        if (!data.backgroundUrl || data.backgroundUrl === null) {
          console.log('MinIO 中無背景圖，清空狀態')
          updateBackground('')
          
          // 清除頁面中所有背景相關的圖像快取
          const imgElements = document.querySelectorAll('img[src*="wedding-background"], img[src*="background-"]')
          imgElements.forEach(img => {
            const imgEl = img as HTMLImageElement
            imgEl.src = ''
            imgEl.removeAttribute('src')
          })
        } else {
          updateBackground(data.backgroundUrl)
        }
      } else {
        // API 回應錯誤，清空背景狀態
        console.log('API 回應錯誤，清空背景狀態')
        updateBackground('')
      }
    } catch (error) {
      console.log('載入背景失敗，清空狀態:', error)
      updateBackground('')
    } finally {
      isLoading.value = false
    }
  }

  return {
    backgroundUrl: readonly(backgroundUrl),
    isLoading: readonly(isLoading),
    updateBackground,
    getBackgroundUrl,
    loadBackground
  }
}