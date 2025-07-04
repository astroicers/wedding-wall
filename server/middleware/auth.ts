import jwt from 'jsonwebtoken'

export interface AuthContext {
  userId?: string
  email?: string
  isAuthenticated: boolean
}

declare module 'h3' {
  interface H3EventContext {
    auth: AuthContext
  }
}

// 將認證資訊注入到 event context
export default defineEventHandler(async (event) => {
  // 只處理 API 路由
  if (!event.node.req.url?.startsWith('/api/')) {
    return
  }
  
  // 公開路由白名單
  const publicRoutes = [
    '/api/auth/sso-callback',
    '/api/messages', // 保持現有功能
    '/api/image/',
    '/api/wall-background',
    '/api/background-image'
  ]
  
  if (publicRoutes.some(route => event.node.req.url?.startsWith(route))) {
    event.context.auth = { isAuthenticated: false }
    return
  }
  
  const token = getCookie(event, 'auth-token') || 
                getHeader(event, 'authorization')?.replace('Bearer ', '')
  
  if (!token) {
    event.context.auth = { isAuthenticated: false }
    return
  }
  
  try {
    const config = useRuntimeConfig()
    const payload = jwt.verify(token, config.jwtSecret) as any
    
    event.context.auth = {
      userId: payload.sub,
      email: payload.email,
      isAuthenticated: true
    }
  } catch (error) {
    event.context.auth = { isAuthenticated: false }
  }
})