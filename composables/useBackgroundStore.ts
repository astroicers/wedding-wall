// 全局背景狀態管理
const backgroundUrl = ref<string>('')
const backgroundVersion = ref(0)

export const useBackgroundStore = () => {
  const updateBackground = (url: string) => {
    backgroundUrl.value = url
    backgroundVersion.value += 1
  }

  const getBackgroundUrl = () => {
    if (!backgroundUrl.value) {
      return ''
    }
    // 添加版本參數避免快取
    return `${backgroundUrl.value}?v=${backgroundVersion.value}`
  }

  const loadBackground = async () => {
    try {
      const response = await fetch('/api/wall-background')
      if (response.ok) {
        const data = await response.json()
        if (data.backgroundUrl) {
          updateBackground(data.backgroundUrl)
        } else {
          backgroundUrl.value = ''
        }
      }
    } catch (error) {
      console.log('載入背景失敗:', error)
    }
  }

  return {
    backgroundUrl: readonly(backgroundUrl),
    backgroundVersion: readonly(backgroundVersion),
    updateBackground,
    getBackgroundUrl,
    loadBackground
  }
}