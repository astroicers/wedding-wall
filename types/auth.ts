export interface User {
  id: string
  email: string
  name: string
  picture?: string
  provider: 'google' | 'keycloak' | 'local'
  createdAt: number
  lastLogin: number
}

export interface AuthState {
  // 保留兼容欄位
  user: string | null  // 用於向後兼容，儲存 username
  isAuthenticated: boolean
  loginTime: number | null
  sessionExpiry: number | null
  
  // SSO 相關欄位
  userProfile: User | null
  userId: string | null
  currentWallId: string | null
  accessToken: string | null
  refreshToken: string | null
  ssoProvider: string | null
}