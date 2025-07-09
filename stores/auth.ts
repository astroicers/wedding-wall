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
      // 只在客戶端執行會話恢復
      if (!process.client || typeof window === 'undefined') {
        console.log('🛡️ SSR environment, skipping session restoration')
        return false
      }
      
      console.log('🔄 Attempting to restore session:', {
        isAuthenticated: this.isAuthenticated,
        sessionExpiry: this.sessionExpiry,
        currentTime: Date.now(),
        isSessionValid: this.isSessionValid,
        userId: this.userId,
        userProfile: !!this.userProfile,
        hasAccessToken: !!this.accessToken,
        hasWindow: typeof window !== 'undefined',
        hasSessionStorage: !!(typeof window !== 'undefined' && window.sessionStorage)
      })
      
      // 檢查 Pinia 持久化的狀態是否已經有效
      if (this.isAuthenticated && this.userId && this.accessToken && this.isSessionValid) {
        console.log('✅ Valid session found in Pinia store')
        
        // 確保 sessionStorage 中也有 token
        if (window.sessionStorage) {
          const storedToken = window.sessionStorage.getItem('auth-token')
          if (!storedToken && this.accessToken) {
            console.log('🔧 Restoring token to sessionStorage')
            window.sessionStorage.setItem('auth-token', this.accessToken)
          }
        }
        return true
      }
      
      // 如果 Pinia 狀態不完整，嘗試從 sessionStorage 恢復
      if (window.sessionStorage) {
        const storedToken = window.sessionStorage.getItem('auth-token')
        console.log('🔍 Checking sessionStorage for token:', {
          hasToken: !!storedToken,
          tokenPreview: storedToken ? `${storedToken.substring(0, 20)}...` : 'none'
        })
        
        if (storedToken) {
          console.log('🔧 Restoring authentication state from sessionStorage token')
          
          try {
            // 清理和解析 JWT token 來恢復完整認證狀態
            let cleanToken = storedToken.trim()
            
            // 如果 token 被 URL 編碼了，先解碼
            if (cleanToken.includes('%')) {
              cleanToken = decodeURIComponent(cleanToken)
            }
            
            console.log('🧹 Token cleaning:', {
              originalLength: storedToken.length,
              cleanedLength: cleanToken.length,
              wasEncoded: storedToken !== cleanToken
            })
            
            const tokenParts = cleanToken.split('.')
            console.log('🧪 Token parts analysis:', {
              totalParts: tokenParts.length,
              headerLength: tokenParts[0]?.length,
              payloadLength: tokenParts[1]?.length,
              signatureLength: tokenParts[2]?.length,
              payloadPreview: tokenParts[1]?.substring(0, 20) + '...'
            })
            
            if (tokenParts.length === 3) {
              // 確保 base64 字符串正確填充
              let payloadPart = tokenParts[1]
              
              // JWT 使用 base64url 編碼，需要轉換為標準 base64
              payloadPart = payloadPart.replace(/-/g, '+').replace(/_/g, '/')
              
              // 添加必要的填充字符
              while (payloadPart.length % 4) {
                payloadPart += '='
              }
              
              console.log('🔧 Base64 payload processing:', {
                originalLength: tokenParts[1].length,
                processedLength: payloadPart.length,
                needsPadding: tokenParts[1].length % 4 !== 0,
                processedPreview: payloadPart.substring(0, 20) + '...'
              })
              
              // 使用 TextDecoder 正確解碼 UTF-8 字符
              const binaryString = atob(payloadPart)
              const bytes = new Uint8Array(binaryString.length)
              for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i)
              }
              const decoder = new TextDecoder('utf-8')
              const decodedString = decoder.decode(bytes)
              const payload = JSON.parse(decodedString)
              console.log('📄 Token payload:', {
                sub: payload.sub,
                email: payload.email,
                exp: payload.exp,
                currentTime: Math.floor(Date.now() / 1000)
              })
              
              // 檢查 token 是否過期
              if (payload.exp && payload.exp > Math.floor(Date.now() / 1000)) {
                // Token 還有效，完全恢復認證狀態
                this.userId = payload.sub
                this.user = payload.email
                this.userProfile = {
                  id: payload.sub,
                  email: payload.email,
                  name: payload.name || payload.email,
                  picture: payload.picture
                }
                this.accessToken = cleanToken // 使用清理後的 token
                this.isAuthenticated = true
                this.sessionExpiry = payload.exp * 1000 // 轉換為毫秒
                this.loginTime = Date.now() - (30 * 60 * 1000) // 估算登入時間
                
                // 如果 token 被清理了，更新 sessionStorage
                if (cleanToken !== storedToken) {
                  console.log('🔄 Updating sessionStorage with cleaned token')
                  window.sessionStorage.setItem('auth-token', cleanToken)
                }
                
                console.log('✅ Complete authentication state restored from sessionStorage')
                return true
              } else {
                console.warn('⏰ Token has expired')
                this.logout()
                return false
              }
            }
          } catch (error) {
            console.error('❌ Failed to parse token:', error)
            this.logout()
            return false
          }
        }
      }
      
      console.warn('❌ No valid session found - clearing state')
      this.logout()
      return false
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
        
        // 清理 token 確保沒有被編碼
        const cleanToken = data.accessToken.trim()
        
        this.userProfile = data.user
        this.userId = data.user.id
        this.user = data.user.email // 保持向後兼容
        this.accessToken = cleanToken // 使用清理後的 token
        this.refreshToken = data.refreshToken
        this.isAuthenticated = true
        this.loginTime = Date.now()
        this.sessionExpiry = Date.now() + (data.expiresIn * 1000)
        
        // Store accessToken in sessionStorage 確保同步 - 不進行任何編碼
        if (process.client && typeof window !== 'undefined' && window.sessionStorage) {
          // 確保 token 是原始字符串，不被編碼
          const cleanToken = data.accessToken.trim()
          window.sessionStorage.setItem('auth-token', cleanToken)
          console.log('🔐 Token stored in sessionStorage:', {
            tokenPreview: `${cleanToken.substring(0, 20)}...`,
            expiresIn: data.expiresIn,
            tokenLength: cleanToken.length,
            isValid: cleanToken.split('.').length === 3
          })
        }
        
        // Pinia 的 persist 會自動保存 accessToken
        console.log('📦 Authentication state saved to Pinia store with persistence:', {
          userId: this.userId,
          isAuthenticated: this.isAuthenticated,
          hasAccessToken: !!this.accessToken
        })
        
        
        // Also set a cookie for server-side authentication checks
        if (process.client && typeof window !== 'undefined') {
          const cleanToken = data.accessToken.trim()
          const authCookie = useCookie('auth-token', {
            maxAge: data.expiresIn,
            secure: false, // Allow HTTP for localhost/Docker
            sameSite: 'lax', // More permissive for Docker
            httpOnly: false, // Allow JS access
            encode: value => value, // 不編碼 - 保持原始值
            decode: value => value  // 不解碼 - 保持原始值
          })
          authCookie.value = cleanToken
          console.log('🍪 Token stored in cookie:', {
            tokenPreview: `${cleanToken.substring(0, 20)}...`,
            tokenLength: cleanToken.length,
            isValid: cleanToken.split('.').length === 3,
            cookieOptions: {
              maxAge: data.expiresIn,
              secure: false,
              sameSite: 'lax',
              httpOnly: false
            }
          })
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
      console.log('🚪 Logging out user, clearing all auth data')
      
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
      if (process.client && typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.removeItem('auth-token')
        console.log('🧹 Cleared auth-token from sessionStorage')
      }
      
      // Clear auth cookie
      if (process.client && typeof window !== 'undefined') {
        const authCookie = useCookie('auth-token', {
          secure: false,
          sameSite: 'lax',
          httpOnly: false,
          encode: value => value, // 不編碼
          decode: value => value  // 不解碼
        })
        authCookie.value = null
        console.log('🍪 Cleared auth-token cookie')
      }
      
      console.log('✅ User logged out - all auth data cleared')
    }
  },

  // 持久化設定 - 修復 SSR 兼容性
  persist: process.client ? {
    storage: {
      getItem: (key: string) => {
        if (typeof window !== 'undefined' && window.sessionStorage) {
          return window.sessionStorage.getItem(key)
        }
        return null
      },
      setItem: (key: string, value: string) => {
        if (typeof window !== 'undefined' && window.sessionStorage) {
          window.sessionStorage.setItem(key, value)
        }
      },
      removeItem: (key: string) => {
        if (typeof window !== 'undefined' && window.sessionStorage) {
          window.sessionStorage.removeItem(key)
        }
      }
    },
    paths: ['user', 'isAuthenticated', 'loginTime', 'sessionExpiry', 'userProfile', 'userId', 'ssoProvider', 'accessToken']
  } : false
})