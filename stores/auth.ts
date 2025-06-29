export interface AuthState {
  user: string | null
  isAuthenticated: boolean
  loginTime: number | null
  sessionExpiry: number | null
  isPasswordProtected: boolean
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    isAuthenticated: false,
    loginTime: null,
    sessionExpiry: null,
    isPasswordProtected: false
  }),

  getters: {
    isSessionValid: (state) => {
      if (!state.isAuthenticated || !state.sessionExpiry) return false
      return Date.now() < state.sessionExpiry
    },

    timeRemaining: (state) => {
      if (!state.sessionExpiry) return 0
      const remaining = state.sessionExpiry - Date.now()
      return Math.max(0, remaining)
    },

    timeRemainingMinutes(): number {
      return Math.floor(this.timeRemaining / (1000 * 60))
    }
  },

  actions: {
    // 登入
    login(username: string) {
      this.user = username.trim()
      this.isAuthenticated = true
      this.loginTime = Date.now()
      // 設定 30 分鐘後過期
      this.sessionExpiry = Date.now() + (30 * 60 * 1000)
      
      console.log('用戶登入成功:', username)
    },

    // 設定已認證狀態（用於密碼保護）
    setAuthenticated(value: boolean) {
      this.isAuthenticated = value
      this.isPasswordProtected = value
      if (value) {
        this.loginTime = Date.now()
        // 設定 3 小時後過期（適合婚禮活動）
        this.sessionExpiry = Date.now() + (3 * 60 * 60 * 1000)
      }
    },

    // 登出
    logout() {
      this.user = null
      this.isAuthenticated = false
      this.loginTime = null
      this.sessionExpiry = null
      
      console.log('用戶已登出')
    },

    // 檢查認證狀態
    checkAuthStatus() {
      if (!this.isSessionValid) {
        this.logout()
        return false
      }
      return true
    },

    // 延長會話
    extendSession() {
      if (this.isAuthenticated) {
        this.sessionExpiry = Date.now() + (30 * 60 * 1000)
        console.log('會話已延長')
      }
    },

    // 從儲存中恢復會話
    restoreSession() {
      // 檢查是否有有效的會話
      if (this.isSessionValid) {
        console.log('會話已恢復:', this.user)
        return true
      } else {
        this.logout()
        return false
      }
    }
  },

  // 持久化設定 - 僅在客戶端啟用
  persist: process.client ? {
    storage: localStorage,
    paths: ['user', 'isAuthenticated', 'loginTime', 'sessionExpiry']
  } : false
})