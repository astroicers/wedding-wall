import type { AuthState, User } from '~/types/auth'

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    // 現有欄位
    user: null,
    isAuthenticated: false,
    loginTime: null,
    sessionExpiry: null,
    isPasswordProtected: false,
    
    // 新增欄位
    userProfile: null,
    userId: null,
    currentWallId: null,
    accessToken: null,
    refreshToken: null,
    ssoProvider: null
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
        // 恢復 accessToken from sessionStorage
        if (process.client && window.sessionStorage) {
          const storedToken = window.sessionStorage.getItem('auth-token')
          if (storedToken) {
            this.accessToken = storedToken
          }
        }
        return true
      } else {
        this.logout()
        return false
      }
    },
    
    // 新增 SSO 登入
    async loginWithSSO(provider: 'google' | 'keycloak') {
      this.ssoProvider = provider
      const config = useRuntimeConfig()
      
      // Debug logging
      console.log('Runtime config:', {
        googleClientId: config.public.googleClientId,
        appUrl: config.public.appUrl,
        authProvider: config.public.authProvider
      })
      
      if (!config.public.googleClientId) {
        throw new Error('Google Client ID 未設定')
      }
      
      const redirectUri = `${config.public.appUrl}/auth/callback`
      
      if (provider === 'google') {
        const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
        authUrl.searchParams.append('client_id', config.public.googleClientId)
        authUrl.searchParams.append('redirect_uri', redirectUri)
        authUrl.searchParams.append('response_type', 'code')
        authUrl.searchParams.append('scope', 'openid email profile')
        authUrl.searchParams.append('state', this.generateState())
        
        console.log('OAuth URL:', authUrl.toString())
        window.location.href = authUrl.toString()
      }
      // Keycloak 實作預留
    },
    
    // 處理 SSO 回調
    async handleSSOCallback(code: string, state: string) {
      try {
        const data = await $fetch('/api/auth/sso-callback', {
          method: 'POST',
          body: { code, state, provider: this.ssoProvider }
        })
        
        this.userProfile = data.user
        this.userId = data.user.id
        this.user = data.user.email // 保持向後兼容
        this.accessToken = data.accessToken
        this.refreshToken = data.refreshToken
        this.isAuthenticated = true
        this.loginTime = Date.now()
        this.sessionExpiry = Date.now() + (data.expiresIn * 1000)
        
        // Store accessToken in sessionStorage only
        if (process.client && window.sessionStorage) {
          window.sessionStorage.setItem('auth-token', data.accessToken)
        }
        
        // Also set a cookie for server-side authentication checks
        if (process.client) {
          const sessionCookie = useCookie('session-token', {
            maxAge: data.expiresIn,
            secure: true,
            sameSite: 'strict'
          })
          sessionCookie.value = data.accessToken
        }
        
        return data
      } catch (error) {
        console.error('SSO callback failed:', error)
        throw error
      }
    },
    
    // 生成 state 參數防止 CSRF
    generateState(): string {
      return btoa(Math.random().toString(36).substring(2))
    },
    
    // 覆寫登出方法以清理 SSO 相關資料
    logout() {
      this.user = null
      this.userProfile = null
      this.userId = null
      this.accessToken = null
      this.refreshToken = null
      this.ssoProvider = null
      this.isAuthenticated = false
      this.loginTime = null
      this.sessionExpiry = null
      
      // Clear sessionStorage
      if (process.client && window.sessionStorage) {
        window.sessionStorage.removeItem('auth-token')
      }
      
      // Clear session cookie
      if (process.client) {
        const sessionCookie = useCookie('session-token')
        sessionCookie.value = null
      }
      
      console.log('用戶已登出')
    }
  },

  // 持久化設定 - 僅在客戶端啟用
  persist: process.client ? {
    storage: localStorage,
    paths: ['user', 'isAuthenticated', 'loginTime', 'sessionExpiry', 'userProfile', 'userId', 'ssoProvider'] // 不包含 tokens
  } : false
})