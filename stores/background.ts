export interface BackgroundState {
  backgroundUrl: string
  isLoading: boolean
  error: string | null
  cacheVersion: number
  lastUpdated: number | null
}

export const useBackgroundStore = defineStore('background', {
  state: (): BackgroundState => ({
    backgroundUrl: '',
    isLoading: false,
    error: null,
    cacheVersion: 0,
    lastUpdated: null
  }),

  getters: {
    // 自動加入快取破壞參數，解決 Chromium 瀏覽器快取問題
    cachedBackgroundUrl: (state) => {
      if (!state.backgroundUrl || state.backgroundUrl.trim() === '') {
        return ''
      }
      
      // 確保每次都有唯一的快取破壞參數
      const separator = state.backgroundUrl.includes('?') ? '&' : '?'
      return `${state.backgroundUrl}${separator}v=${state.cacheVersion}&t=${Date.now()}`
    },

    hasBackground: (state) => {
      return !!(state.backgroundUrl && state.backgroundUrl.trim())
    },

    isReady: (state) => {
      return !state.isLoading && !state.error
    }
  },

  actions: {
    // 載入背景圖片
    async loadBackground(force = false) {
      // 如果已經在載入中且不是強制載入，則跳過
      if (this.isLoading && !force) return

      this.isLoading = true
      this.error = null

      try {
        // 強制重新從 MinIO 取得，避免 API 快取
        const cacheBuster = force ? `?cb=${Date.now()}` : ''
        const response = await fetch(`/api/wall-background${cacheBuster}`)

        if (response.ok) {
          const data = await response.json()
          
          // 如果 MinIO 中沒有背景圖，強制清空
          if (!data.backgroundUrl || data.backgroundUrl === null) {
            console.log('MinIO 中無背景圖，清空狀態')
            this.clearBackground()
            this.clearImageCache()
          } else {
            this.setBackground(data.backgroundUrl)
            console.log('背景載入成功:', data.backgroundUrl)
          }
        } else {
          // API 回應錯誤，清空背景狀態
          console.log('API 回應錯誤，清空背景狀態')
          this.clearBackground()
          this.error = 'API 載入失敗'
        }
      } catch (error: any) {
        console.log('載入背景失敗，清空狀態:', error)
        this.clearBackground()
        this.error = error.message || '載入背景失敗'
      } finally {
        this.isLoading = false
      }
    },

    // 設定背景圖片
    setBackground(url: string) {
      this.backgroundUrl = url || ''
      this.lastUpdated = Date.now()
      this.cacheVersion++
      this.error = null
      console.log('背景 URL 已更新:', url, '快取版本:', this.cacheVersion)
    },

    // 清空背景圖片
    clearBackground() {
      this.backgroundUrl = ''
      this.lastUpdated = Date.now()
      this.cacheVersion++
      this.error = null
      console.log('背景已清空，快取版本:', this.cacheVersion)
    },

    // 上傳背景圖片
    async uploadBackground(file: File) {
      this.isLoading = true
      this.error = null

      try {
        const formData = new FormData()
        formData.append('background', file)

        const response = await fetch('/api/wall-background', {
          method: 'POST',
          body: formData
        })

        if (response.ok) {
          const data = await response.json()
          this.setBackground(data.backgroundUrl)
          
          // 通知其他頁面背景已更新
          if (window.parent) {
            window.parent.postMessage({ type: 'BACKGROUND_UPDATED' }, '*')
          }
          
          return { success: true, data }
        } else {
          const errorData = await response.json()
          this.error = errorData.statusMessage || '上傳失敗'
          throw new Error(this.error)
        }
      } catch (error: any) {
        this.error = error.message || '上傳失敗'
        console.error('上傳錯誤:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // 移除背景圖片
    async removeBackground() {
      this.isLoading = true
      this.error = null

      try {
        const response = await fetch('/api/wall-background', {
          method: 'DELETE'
        })

        if (response.ok) {
          const data = await response.json()
          console.log('背景移除完成:', data)
          
          // 強制清空狀態和快取
          this.clearBackground()
          this.clearImageCache()
          
          return { success: true, data }
        } else {
          this.error = '移除失敗'
          throw new Error(this.error)
        }
      } catch (error: any) {
        this.error = error.message || '移除失敗'
        console.error('移除錯誤:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // 清除瀏覽器圖像快取
    clearImageCache() {
      try {
        // 清除頁面中所有背景相關的圖像快取
        const imgElements = document.querySelectorAll('img[src*="wedding-background"], img[src*="background-"]')
        imgElements.forEach(img => {
          const imgEl = img as HTMLImageElement
          const currentSrc = imgEl.src
          imgEl.src = ''
          imgEl.removeAttribute('src')
          
          // 如果圖像還需要顯示，設定新的 src
          setTimeout(() => {
            if (imgEl.parentElement && this.backgroundUrl) {
              imgEl.src = this.cachedBackgroundUrl
            }
          }, 10)
        })
        
        console.log('圖像快取已清除')
      } catch (error) {
        console.warn('清除圖像快取時發生錯誤:', error)
      }
    },

    // 強制重新整理快取版本
    refreshCache() {
      this.cacheVersion++
      console.log('快取版本已更新:', this.cacheVersion)
    },

    // 清除錯誤狀態
    clearError() {
      this.error = null
    }
  }
})