# 多租戶祝福墻實作文件

## 📋 專案概覽

### 目標
- 在現有單租戶架構上擴展多租戶功能
- 支援每個用戶創建多個祝福墻
- 整合 Google OAuth（可替換為 Keycloak）
- 保持向後兼容性

### 技術架構
- **前端**: Nuxt 3 + Vue 3 + TypeScript
- **認證**: Google OAuth 2.0 → Keycloak
- **存儲**: MinIO (純文件存儲)
- **狀態管理**: Pinia

## 🏗️ Phase 1: 用戶系統實作 (Week 1-3)

### 1.1 擴展 Auth Store

```typescript
// stores/auth.ts - 擴展現有的 auth store
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
  // 現有欄位
  user: string | null  // 保持兼容，後續改為 username
  isAuthenticated: boolean
  loginTime: number | null
  sessionExpiry: number | null
  isPasswordProtected: boolean
  
  // 新增欄位
  userProfile: User | null
  userId: string | null
  currentWallId: string | null
  accessToken: string | null
  refreshToken: string | null
  ssoProvider: string | null
}

// 新增 actions
export const useAuthStore = defineStore('auth', {
  // ... 現有代碼保持不變
  
  actions: {
    // 新增 SSO 登入
    async loginWithSSO(provider: 'google' | 'keycloak') {
      const config = useRuntimeConfig()
      const redirectUri = `${window.location.origin}/auth/callback`
      
      if (provider === 'google') {
        const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
        authUrl.searchParams.append('client_id', config.public.googleClientId)
        authUrl.searchParams.append('redirect_uri', redirectUri)
        authUrl.searchParams.append('response_type', 'code')
        authUrl.searchParams.append('scope', 'openid email profile')
        authUrl.searchParams.append('state', this.generateState())
        
        window.location.href = authUrl.toString()
      }
      // Keycloak 實作預留
    },
    
    // 處理 SSO 回調
    async handleSSOCallback(code: string, state: string) {
      try {
        const { data } = await $fetch('/api/auth/sso-callback', {
          method: 'POST',
          body: { code, state, provider: this.ssoProvider }
        })
        
        this.userProfile = data.user
        this.userId = data.user.id
        this.accessToken = data.accessToken
        this.refreshToken = data.refreshToken
        this.isAuthenticated = true
        this.loginTime = Date.now()
        this.sessionExpiry = Date.now() + (data.expiresIn * 1000)
        
        return data
      } catch (error) {
        console.error('SSO callback failed:', error)
        throw error
      }
    },
    
    // 生成 state 參數防止 CSRF
    generateState(): string {
      return btoa(Math.random().toString(36).substring(2))
    }
  }
})
```

### 1.2 Google OAuth 設定

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  // ... 現有設定
  
  runtimeConfig: {
    // 私有設定 (僅伺服器端)
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
    jwtSecret: process.env.JWT_SECRET || 'your-jwt-secret',
    
    public: {
      // 公開設定
      googleClientId: process.env.GOOGLE_CLIENT_ID,
      authProvider: process.env.AUTH_PROVIDER || 'google', // 'google' | 'keycloak'
    }
  }
})
```

### 1.3 SSO 回調處理 API

```typescript
// server/api/auth/sso-callback.post.ts
import jwt from 'jsonwebtoken'
import { OAuth2Client } from 'google-auth-library'
import { minioClient } from '~/server/utils/minio'

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
      config.googleClientId,
      config.googleClientSecret,
      `${process.env.APP_URL}/auth/callback`
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
async function createOrUpdateUser(ssoUser: SSOUser, provider: string) {
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
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      name: user.name
    },
    config.jwtSecret,
    { expiresIn: '1h' }
  )
}

function generateRefreshToken(user: User): string {
  const config = useRuntimeConfig()
  return jwt.sign(
    { sub: user.id },
    config.jwtSecret,
    { expiresIn: '7d' }
  )
}
```

### 1.4 認證中間件

```typescript
// server/middleware/auth.ts
import jwt from 'jsonwebtoken'

export interface AuthContext {
  userId?: string
  email?: string
  isAuthenticated: boolean
}

// 將認證資訊注入到 event context
export default defineEventHandler(async (event) => {
  // 只處理 API 路由
  if (!event.node.req.url?.startsWith('/api/')) {
    return
  }
  
  // 公開路由白名單
  const publicRoutes = [
    '/api/auth/login',
    '/api/auth/sso-callback',
    '/api/messages', // 保持現有功能
    '/api/image/'
  ]
  
  if (publicRoutes.some(route => event.node.req.url?.startsWith(route))) {
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
```

### 1.5 前端認證頁面

```vue
<!-- pages/auth/callback.vue -->
<template>
  <div class="auth-callback">
    <div class="loading-container">
      <el-icon class="is-loading" :size="60">
        <Loading />
      </el-icon>
      <h2>正在登入...</h2>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

onMounted(async () => {
  try {
    const code = route.query.code as string
    const state = route.query.state as string
    
    if (!code) {
      throw new Error('Missing authorization code')
    }
    
    await authStore.handleSSOCallback(code, state)
    
    // 導向用戶的墻列表
    await router.push(`/${authStore.userId}/walls`)
  } catch (error) {
    console.error('Authentication failed:', error)
    await router.push('/auth/login?error=auth_failed')
  }
})
</script>
```

## 🏗️ Phase 2: 多墻功能實作 (Week 4-6)

### 2.1 墻管理 Store

```typescript
// stores/walls.ts
export interface WallSettings {
  theme: 'default' | 'polaroid' | 'instagram' | 'magazine'
  backgroundColor: string
  fontFamily: string
  autoApprove: boolean
  requirePassword: boolean
  password?: string
}

export interface Wall {
  id: string
  userId: string
  name: string
  description: string
  slug: string // URL 友好的標識符
  isActive: boolean
  isPublic: boolean
  createdAt: number
  updatedAt: number
  settings: WallSettings
  messageCount: number
}

export const useWallsStore = defineStore('walls', {
  state: () => ({
    walls: [] as Wall[],
    currentWall: null as Wall | null,
    loading: false,
    error: null as string | null
  }),
  
  actions: {
    // 載入用戶的所有墻
    async fetchUserWalls(userId: string) {
      this.loading = true
      try {
        const { data } = await $fetch(`/api/users/${userId}/walls`)
        this.walls = data.walls
      } catch (error) {
        this.error = '載入失敗'
        throw error
      } finally {
        this.loading = false
      }
    },
    
    // 創建新墻
    async createWall(wallData: Partial<Wall>) {
      const authStore = useAuthStore()
      const { data } = await $fetch('/api/walls', {
        method: 'POST',
        body: {
          ...wallData,
          userId: authStore.userId
        }
      })
      
      this.walls.push(data.wall)
      return data.wall
    },
    
    // 切換當前墻
    async switchWall(wallId: string) {
      const wall = this.walls.find(w => w.id === wallId)
      if (!wall) {
        throw new Error('Wall not found')
      }
      
      this.currentWall = wall
      
      // 更新 messages store 來載入對應墻的訊息
      const messagesStore = useMessagesStore()
      await messagesStore.fetchWallMessages(wall.userId, wall.id)
    }
  }
})
```

### 2.2 擴展 Messages Store

```typescript
// stores/messages.ts - 修改現有 store
export const useMessagesStore = defineStore('messages', {
  state: (): MessagesState => ({
    // ... 現有 state
    wallId: null as string | null,
    userId: null as string | null
  }),
  
  actions: {
    // 修改現有的 fetchMessages，添加墻支援
    async fetchWallMessages(userId: string, wallId: string, showError = true) {
      this.userId = userId
      this.wallId = wallId
      
      if (this.loading) return
      
      this.loading = true
      if (showError) this.error = null
      
      try {
        const response = await fetch(`/api/users/${userId}/walls/${wallId}/messages`)
        
        if (response.ok) {
          const data = await response.json()
          this.messages = data.messages || []
          this.lastUpdated = Date.now()
        } else {
          throw new Error('載入訊息失敗')
        }
      } catch (error: any) {
        if (showError) {
          this.error = error.message || '載入訊息失敗'
        }
      } finally {
        this.loading = false
      }
    },
    
    // 保持向後兼容的 fetchMessages
    async fetchMessages(showError = true) {
      // 如果沒有指定墻，使用預設行為
      if (!this.wallId) {
        // 呼叫原始 API，保持兼容性
        return this.fetchLegacyMessages(showError)
      }
      
      return this.fetchWallMessages(this.userId!, this.wallId, showError)
    },
    
    // 原始的訊息載入（保持兼容）
    async fetchLegacyMessages(showError = true) {
      // ... 現有的 fetchMessages 邏輯
    }
  }
})
```

### 2.3 多墻 API 端點

```typescript
// server/api/users/[userId]/walls/index.get.ts
export default defineEventHandler(async (event) => {
  const userId = getRouterParam(event, 'userId')
  const { auth } = event.context
  
  // 權限檢查：只能查看自己的墻列表
  if (auth.userId !== userId) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden'
    })
  }
  
  try {
    const bucket = 'wedding-wall'
    const prefix = `users/${userId}/walls/`
    
    const walls: Wall[] = []
    const stream = minioClient.listObjects(bucket, prefix, true)
    
    for await (const obj of stream) {
      if (obj.name?.endsWith('/metadata.json')) {
        const wallData = await minioClient.getObject(bucket, obj.name)
        const wall = JSON.parse(await streamToString(wallData))
        walls.push(wall)
      }
    }
    
    return { walls }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch walls'
    })
  }
})

// server/api/walls/index.post.ts
export default defineEventHandler(async (event) => {
  const { auth } = event.context
  
  if (!auth.isAuthenticated) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }
  
  const body = await readBody(event)
  
  // 生成唯一 ID
  const wallId = `wall_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  const wall: Wall = {
    id: wallId,
    userId: auth.userId!,
    name: body.name || '未命名祝福墻',
    description: body.description || '',
    slug: generateSlug(body.name || wallId),
    isActive: true,
    isPublic: body.isPublic ?? true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    settings: {
      theme: body.theme || 'default',
      backgroundColor: body.backgroundColor || '#ffffff',
      fontFamily: body.fontFamily || 'default',
      autoApprove: body.autoApprove ?? false,
      requirePassword: body.requirePassword ?? false,
      password: body.password
    },
    messageCount: 0
  }
  
  // 儲存墻資料
  const bucket = 'wedding-wall'
  const wallPath = `users/${auth.userId}/walls/${wallId}/metadata.json`
  
  await minioClient.putObject(
    bucket,
    wallPath,
    JSON.stringify(wall, null, 2),
    {
      'Content-Type': 'application/json'
    }
  )
  
  return { wall }
})

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
```

### 2.4 前端路由結構

```vue
<!-- pages/[userId]/walls/index.vue - 墻列表頁 -->
<template>
  <div class="walls-list">
    <div class="header">
      <h1>我的祝福墻</h1>
      <el-button type="primary" @click="showCreateDialog = true">
        創建新墻
      </el-button>
    </div>
    
    <div class="walls-grid">
      <div
        v-for="wall in walls"
        :key="wall.id"
        class="wall-card"
        @click="goToWall(wall)"
      >
        <h3>{{ wall.name }}</h3>
        <p>{{ wall.description }}</p>
        <div class="wall-stats">
          <span>{{ wall.messageCount }} 則祝福</span>
          <span>{{ formatDate(wall.createdAt) }}</span>
        </div>
      </div>
    </div>
    
    <!-- 創建墻對話框 -->
    <el-dialog v-model="showCreateDialog" title="創建新祝福墻">
      <el-form :model="newWall" label-width="100px">
        <el-form-item label="名稱">
          <el-input v-model="newWall.name" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="newWall.description" type="textarea" />
        </el-form-item>
        <el-form-item label="主題">
          <el-select v-model="newWall.theme">
            <el-option label="預設" value="default" />
            <el-option label="拍立得" value="polaroid" />
            <el-option label="Instagram" value="instagram" />
            <el-option label="雜誌" value="magazine" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="createWall">創建</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const wallsStore = useWallsStore()
const authStore = useAuthStore()

const userId = route.params.userId as string
const walls = computed(() => wallsStore.walls)
const showCreateDialog = ref(false)
const newWall = ref({
  name: '',
  description: '',
  theme: 'default'
})

// 權限檢查
if (authStore.userId !== userId) {
  throw createError({
    statusCode: 403,
    statusMessage: 'Forbidden'
  })
}

// 載入墻列表
await wallsStore.fetchUserWalls(userId)

async function createWall() {
  const wall = await wallsStore.createWall(newWall.value)
  showCreateDialog.value = false
  await router.push(`/${userId}/walls/${wall.id}`)
}

function goToWall(wall: Wall) {
  router.push(`/${userId}/walls/${wall.id}`)
}
</script>
```

## 🔄 Phase 3: 資料遷移策略 (Week 7)

### 3.1 遷移腳本

```typescript
// scripts/migrate-to-multi-tenant.ts
import { minioClient } from '../server/utils/minio'

async function migrate() {
  console.log('開始遷移到多租戶架構...')
  
  const bucket = 'wedding-wall'
  const defaultUserId = 'default_user'
  const defaultWallId = 'default_wall'
  
  // 1. 創建預設用戶
  const defaultUser = {
    id: defaultUserId,
    email: 'default@wedding-wall.com',
    name: 'Default User',
    provider: 'local',
    createdAt: Date.now(),
    lastLogin: Date.now()
  }
  
  await minioClient.putObject(
    bucket,
    `users/${defaultUserId}/profile.json`,
    JSON.stringify(defaultUser, null, 2)
  )
  
  // 2. 創建預設墻
  const defaultWall = {
    id: defaultWallId,
    userId: defaultUserId,
    name: '預設祝福墻',
    description: '從舊版本遷移的祝福墻',
    slug: 'default',
    isActive: true,
    isPublic: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    settings: {
      theme: 'default',
      backgroundColor: '#ffffff',
      fontFamily: 'default',
      autoApprove: true,
      requirePassword: false
    },
    messageCount: 0
  }
  
  await minioClient.putObject(
    bucket,
    `users/${defaultUserId}/walls/${defaultWallId}/metadata.json`,
    JSON.stringify(defaultWall, null, 2)
  )
  
  // 3. 遷移現有訊息
  const messagesStream = minioClient.listObjects(bucket, '', true)
  let messageCount = 0
  
  for await (const obj of messagesStream) {
    if (obj.name?.endsWith('.json') && !obj.name.includes('users/')) {
      // 讀取舊訊息
      const oldData = await minioClient.getObject(bucket, obj.name)
      const message = JSON.parse(await streamToString(oldData))
      
      // 生成新路徑
      const messageId = `msg_${Date.now()}_${messageCount++}`
      const newPath = `users/${defaultUserId}/walls/${defaultWallId}/messages/${messageId}.json`
      
      // 儲存到新位置
      await minioClient.putObject(bucket, newPath, JSON.stringify(message))
      
      console.log(`遷移訊息: ${obj.name} -> ${newPath}`)
    }
  }
  
  // 4. 更新墻的訊息計數
  defaultWall.messageCount = messageCount
  await minioClient.putObject(
    bucket,
    `users/${defaultUserId}/walls/${defaultWallId}/metadata.json`,
    JSON.stringify(defaultWall, null, 2)
  )
  
  console.log(`遷移完成！共遷移 ${messageCount} 則訊息`)
}

// 執行遷移
migrate().catch(console.error)
```

### 3.2 相容性路由

```typescript
// server/api/messages.get.ts - 修改現有 API 保持兼容
export default defineEventHandler(async (event) => {
  // 檢查是否為新版 API 呼叫
  const { userId, wallId } = getQuery(event)
  
  if (userId && wallId) {
    // 新版多租戶邏輯
    return $fetch(`/api/users/${userId}/walls/${wallId}/messages`, {
      headers: event.node.req.headers
    })
  }
  
  // 舊版相容邏輯 - 導向預設墻
  return $fetch('/api/users/default_user/walls/default_wall/messages')
})
```

## 🔐 安全性考量

### 權限矩陣

| 操作 | 擁有者 | 已認證用戶 | 訪客 |
|------|--------|------------|------|
| 查看公開墻 | ✅ | ✅ | ✅ |
| 查看私人墻 | ✅ | ❌ | ❌ |
| 發送祝福 | ✅ | ✅ | ✅* |
| 管理墻 | ✅ | ❌ | ❌ |
| 審核訊息 | ✅ | ❌ | ❌ |

*需要墻的設定允許

### JWT Token 結構
```json
{
  "sub": "user_id",
  "email": "user@email.com",
  "name": "User Name",
  "iat": 1234567890,
  "exp": 1234567890
}
```

## 📝 環境變數設定

```bash
# .env
# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# JWT
JWT_SECRET=your-jwt-secret-key

# App
APP_URL=https://your-domain.com

# MinIO (現有)
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET_NAME=wedding-wall

# 未來 Keycloak 設定
KEYCLOAK_REALM=wedding-wall
KEYCLOAK_CLIENT_ID=wedding-wall-client
KEYCLOAK_CLIENT_SECRET=your-keycloak-secret
KEYCLOAK_SERVER_URL=https://keycloak.your-domain.com
```

## 🚀 部署考量

### Docker Compose 更新

```yaml
version: '3.8'

services:
  minio:
    # ... 現有 MinIO 設定
    
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
      - GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
      - JWT_SECRET=${JWT_SECRET}
      - APP_URL=${APP_URL}
      # ... 其他環境變數
    depends_on:
      - minio
      
  # 未來可選：Keycloak
  # keycloak:
  #   image: quay.io/keycloak/keycloak:latest
  #   environment:
  #     - KEYCLOAK_ADMIN=admin
  #     - KEYCLOAK_ADMIN_PASSWORD=admin
  #   ports:
  #     - "8080:8080"
```

## 📊 效能優化

1. **快取策略**
   - 用戶資料快取 5 分鐘
   - 墻列表快取 2 分鐘
   - 訊息列表使用現有的即時更新機制

2. **MinIO 查詢優化**
   - 使用 prefix 查詢減少掃描範圍
   - 批次讀取減少 API 呼叫

3. **前端優化**
   - 路由預載入
   - 懶載入非關鍵組件

## 🔍 監控與日誌

```typescript
// 添加用戶活動日誌
interface UserActivity {
  userId: string
  action: string
  wallId?: string
  timestamp: number
  metadata?: any
}

// 記錄關鍵操作
async function logActivity(activity: UserActivity) {
  const bucket = 'wedding-wall'
  const date = new Date(activity.timestamp)
  const logPath = `logs/${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}/${activity.userId}.jsonl`
  
  const logEntry = JSON.stringify(activity) + '\n'
  // Append to log file
  // ... MinIO append 邏輯
}
```

## ✅ 測試計劃

1. **單元測試**
   - SSO token 驗證
   - JWT 生成與驗證
   - 權限檢查邏輯

2. **整合測試**
   - Google OAuth 流程
   - 多墻切換
   - 資料遷移腳本

3. **E2E 測試**
   - 完整登入流程
   - 創建與管理多個墻
   - 訪客存取公開墻

這個實作文件提供了完整的多租戶功能實現方案，保持了向後兼容性，並為未來的 Keycloak 整合預留了擴展空間。