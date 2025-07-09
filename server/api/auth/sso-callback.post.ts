import jwt from 'jsonwebtoken'
import { OAuth2Client } from 'google-auth-library'
import { minioClient } from '~/server/utils/minio'
import { streamToString } from '~/server/utils/stream'
import type { User } from '~/types/auth'

// SSO 提供者介面 (策略模式，方便未來替換)
interface SSOProvider {
  validateToken(code: string): Promise<SSOUser>
}

interface SSOUser {
  id: string
  email: string
  name: string
  picture?: string
}

// Google OAuth 實作
class GoogleOAuthProvider implements SSOProvider {
  private client: OAuth2Client
  
  constructor() {
    const config = useRuntimeConfig()
    this.client = new OAuth2Client(
      config.public.googleClientId,
      config.googleClientSecret,
      `${config.public.appUrl}/auth/callback`
    )
  }
  
  async validateToken(code: string): Promise<SSOUser> {
    const { tokens } = await this.client.getToken(code)
    const ticket = await this.client.verifyIdToken({
      idToken: tokens.id_token!,
      audience: useRuntimeConfig().public.googleClientId
    })
    
    const payload = ticket.getPayload()!
    return {
      id: payload.sub,
      email: payload.email!,
      name: payload.name!,
      picture: payload.picture
    }
  }
}

// Keycloak 實作 (預留)
class KeycloakProvider implements SSOProvider {
  async validateToken(code: string): Promise<SSOUser> {
    // TODO: 實作 Keycloak token 驗證
    throw new Error('Keycloak provider not implemented yet')
  }
}

// 工廠函數
function createSSOProvider(provider: string): SSOProvider {
  switch (provider) {
    case 'google':
      return new GoogleOAuthProvider()
    case 'keycloak':
      return new KeycloakProvider()
    default:
      throw new Error(`Unknown SSO provider: ${provider}`)
  }
}

export default defineEventHandler(async (event) => {
  try {
    const { code, state, provider = 'google' } = await readBody(event)
    
    // 驗證 state 防止 CSRF
    // TODO: 實作 state 驗證邏輯
    
    // 使用對應的 SSO 提供者驗證 token
    const ssoProvider = createSSOProvider(provider)
    const ssoUser = await ssoProvider.validateToken(code)
    
    // 創建或更新用戶
    const user = await createOrUpdateUser(ssoUser, provider)
    
    // 生成 JWT tokens
    const accessToken = generateAccessToken(user)
    const refreshToken = generateRefreshToken(user)
    
    return {
      user,
      accessToken,
      refreshToken,
      expiresIn: 3600 // 1 hour
    }
  } catch (error: any) {
    throw createError({
      statusCode: 401,
      statusMessage: error.message || 'Authentication failed'
    })
  }
})

// 用戶管理函數
async function createOrUpdateUser(ssoUser: SSOUser, provider: string): Promise<User> {
  const bucket = 'wedding-wall'
  const userPath = `users/${ssoUser.id}/profile.json`
  
  let user: User
  
  try {
    // 嘗試獲取現有用戶
    const stream = await minioClient.getObject(bucket, userPath)
    const existingData = await streamToString(stream)
    user = JSON.parse(existingData)
    
    // 更新最後登入時間
    user.lastLogin = Date.now()
  } catch (error) {
    // 創建新用戶
    user = {
      id: ssoUser.id,
      email: ssoUser.email,
      name: ssoUser.name,
      picture: ssoUser.picture,
      provider: provider as any,
      createdAt: Date.now(),
      lastLogin: Date.now()
    }
  }
  
  // 儲存用戶資料
  await minioClient.putObject(
    bucket,
    userPath,
    JSON.stringify(user, null, 2),
    {
      'Content-Type': 'application/json'
    }
  )
  
  return user
}

// JWT 生成函數
function generateAccessToken(user: User): string {
  const config = useRuntimeConfig()
  console.log('🔑 Generating JWT with secret available:', !!config.jwtSecret, 'for user:', user.id)
  
  // 確保所有字符串都是正確的 UTF-8 編碼
  const token = jwt.sign(
    {
      sub: user.id,
      email: user.email,
      name: user.name ? Buffer.from(user.name, 'utf8').toString('utf8') : user.name,
      picture: user.picture
    },
    config.jwtSecret,
    { expiresIn: '1h' }
  )
  
  console.log('✅ JWT generated:', {
    tokenPreview: `${token.substring(0, 20)}...`,
    tokenLength: token.length,
    userId: user.id,
    secretLength: config.jwtSecret?.length || 0,
    secretPreview: config.jwtSecret ? `${config.jwtSecret.substring(0, 16)}...` : 'null'
  })
  
  return token
}

function generateRefreshToken(user: User): string {
  const config = useRuntimeConfig()
  return jwt.sign(
    { sub: user.id },
    config.jwtSecret,
    { expiresIn: '7d' }
  )
}