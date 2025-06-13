export interface Notification {
  id: string
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
  timestamp: number
  duration?: number
}

export interface UIState {
  notifications: Notification[]
  isGlobalLoading: boolean
  currentPage: string
  sidebarCollapsed: boolean
  theme: 'light' | 'dark'
  deviceType: 'mobile' | 'tablet' | 'desktop'
}

export const useUIStore = defineStore('ui', {
  state: (): UIState => ({
    notifications: [],
    isGlobalLoading: false,
    currentPage: '',
    sidebarCollapsed: false,
    theme: 'light',
    deviceType: 'desktop'
  }),

  getters: {
    activeNotifications: (state) => {
      const now = Date.now()
      return state.notifications.filter(notification => {
        if (!notification.duration) return true
        return (now - notification.timestamp) < notification.duration
      })
    },

    isMobile: (state) => state.deviceType === 'mobile',
    isTablet: (state) => state.deviceType === 'tablet',
    isDesktop: (state) => state.deviceType === 'desktop'
  },

  actions: {
    // 顯示通知
    async showNotification(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info', duration = 3000) {
      const notification: Notification = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        message,
        type,
        timestamp: Date.now(),
        duration
      }

      this.notifications.push(notification)

      // 使用 Element Plus 的通知系統
      if (process.client) {
        const { ElMessage } = await import('element-plus')
        ElMessage({
          message,
          type,
          duration
        })
      }

      console.log('通知已顯示:', message, type)
    },

    // 移除通知
    removeNotification(id: string) {
      this.notifications = this.notifications.filter(n => n.id !== id)
    },

    // 清除所有通知
    clearNotifications() {
      this.notifications = []
    },

    // 清除過期通知
    clearExpiredNotifications() {
      const now = Date.now()
      this.notifications = this.notifications.filter(notification => {
        if (!notification.duration) return true
        return (now - notification.timestamp) < notification.duration
      })
    },

    // 設定全域載入狀態
    setGlobalLoading(loading: boolean) {
      this.isGlobalLoading = loading
    },

    // 設定當前頁面
    setCurrentPage(page: string) {
      this.currentPage = page
    },

    // 切換側邊欄
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed
    },

    // 設定主題
    setTheme(theme: 'light' | 'dark') {
      this.theme = theme
      
      if (process.client) {
        document.documentElement.setAttribute('data-theme', theme)
        localStorage.setItem('theme', theme)
      }
    },

    // 設定設備類型
    setDeviceType(type: 'mobile' | 'tablet' | 'desktop') {
      this.deviceType = type
    },

    // 初始化 UI 設定
    initializeUI() {
      if (process.client) {
        // 恢復主題設定
        const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
        if (savedTheme) {
          this.setTheme(savedTheme)
        }

        // 檢測設備類型
        const checkDeviceType = () => {
          const width = window.innerWidth
          if (width < 768) {
            this.setDeviceType('mobile')
          } else if (width < 1024) {
            this.setDeviceType('tablet')
          } else {
            this.setDeviceType('desktop')
          }
        }

        checkDeviceType()
        window.addEventListener('resize', checkDeviceType)

        // 定期清除過期通知
        setInterval(() => {
          this.clearExpiredNotifications()
        }, 5000)
      }
    }
  },

  // 持久化設定 - 僅在客戶端啟用
  persist: process.client ? {
    storage: localStorage,
    paths: ['theme', 'sidebarCollapsed']
  } : false
})