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
  
  const cookieToken = getCookie(event, 'auth-token')
  const authHeader = getHeader(event, 'authorization')
  const headerToken = authHeader?.replace('Bearer ', '')
  
  // 優先使用 Authorization header，因為它不會被 URL 編碼
  const token = headerToken || cookieToken
  
  console.log('🔐 Server auth middleware:', {
    url: event.node.req.url,
    hasCookie: !!cookieToken,
    hasAuthHeader: !!authHeader,
    authHeaderRaw: authHeader ? `${authHeader.substring(0, 30)}...` : 'null',
    cookieTokenLength: cookieToken?.length || 0,
    headerTokenLength: headerToken?.length || 0,
    tokenSource: headerToken ? 'header' : (cookieToken ? 'cookie' : 'none'),
    tokenPreview: token ? `${token.substring(0, 20)}...` : 'null',
    tokenLength: token ? token.length : 0
  })
  
  if (!token) {
    console.log('❌ No token found')
    event.context.auth = { isAuthenticated: false }
    return
  }
  
  try {
    const config = useRuntimeConfig()
    console.log('🔑 JWT verification - Secret available:', !!config.jwtSecret, 'length:', config.jwtSecret?.length || 0, 'preview:', config.jwtSecret ? `${config.jwtSecret.substring(0, 16)}...` : 'null')
    
    const payload = jwt.verify(token, config.jwtSecret) as any
    
    console.log('✅ JWT verification successful:', {
      userId: payload.sub,
      email: payload.email,
      exp: payload.exp
    })
    
    event.context.auth = {
      userId: payload.sub,
      email: payload.email,
      isAuthenticated: true
    }
  } catch (error: any) {
    console.log('❌ JWT verification failed:', {
      error: error.message,
      tokenPreview: token ? `${token.substring(0, 20)}...` : 'null'
    })
    event.context.auth = { isAuthenticated: false }
  }
})