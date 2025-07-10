<template>
  <div class="walls-page">
    <div class="container">
      <!-- 用戶資訊 -->
      <div class="user-header">
        <img 
          v-if="userDisplayInfo.picture && !avatarError" 
          :src="userDisplayInfo.picture" 
          :alt="userDisplayInfo.name"
          class="user-avatar"
          @error="handleAvatarError"
        >
        <div v-else class="user-avatar-placeholder">
          <el-icon size="32"><User /></el-icon>
        </div>
        <div class="user-info">
          <h1>{{ userDisplayInfo.name }}的祝福牆</h1>
          <p>{{ userDisplayInfo.email }}</p>
        </div>
        <div class="header-actions">
          <el-button type="primary" @click="showCreateDialog = true" :loading="wallsStore.loading">
            <el-icon><Plus /></el-icon>
            創建新祝福牆
          </el-button>
          <el-button @click="logout" type="danger" plain>
            <el-icon><SwitchButton /></el-icon>
            登出
          </el-button>
        </div>
      </div>

      <!-- 加載狀態 -->
      <div v-if="wallsStore.loading && walls.length === 0" class="loading-container">
        <el-skeleton :rows="3" animated />
        <p>加載祝福牆列表中...</p>
      </div>

      <!-- 錯誤狀態 -->
      <el-alert
        v-if="wallsStore.error"
        type="error"
        :title="wallsStore.error"
        show-icon
        :closable="false"
        class="error-alert"
      />

      <!-- 空狀態 -->
      <div v-if="!wallsStore.loading && walls.length === 0 && !wallsStore.error" class="empty-state">
        <el-empty description="您還沒有創建任何祝福牆">
          <el-button type="primary" @click="showCreateDialog = true">
            <el-icon><Plus /></el-icon>
            創建第一個祝福牆
          </el-button>
        </el-empty>
      </div>

      <!-- 祝福牆網格 -->
      <div v-if="walls.length > 0" class="walls-grid">
        <div
          v-for="wall in walls"
          :key="wall.id"
          class="wall-card"
          @click="navigateToWall(wall)"
        >
          <div class="wall-card-header">
            <div class="wall-theme-indicator" :class="`theme-${wall.settings.theme}`"></div>
            <el-dropdown @command="handleWallAction" trigger="click">
              <el-button text @click.stop>
                <el-icon><MoreFilled /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item :command="`edit-${wall.id}`">
                    <el-icon><Edit /></el-icon>
                    編輯設定
                  </el-dropdown-item>
                  <el-dropdown-item :command="`duplicate-${wall.id}`">
                    <el-icon><CopyDocument /></el-icon>
                    複製祝福牆
                  </el-dropdown-item>
                  <el-dropdown-item :command="`delete-${wall.id}`" divided>
                    <el-icon><Delete /></el-icon>
                    隱藏祝福牆
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
          
          <div class="wall-card-body">
            <h3 class="wall-name">{{ wall.name }}</h3>
            <p class="wall-description">{{ wall.description || '暫無描述' }}</p>
            
            <div class="wall-stats">
              <div class="stat-item">
                <el-icon><Message /></el-icon>
                <span>{{ wall.messageCount }} 則訊息</span>
              </div>
              <div class="stat-item">
                <el-icon><Calendar /></el-icon>
                <span>{{ formatDate(wall.createdAt) }}</span>
              </div>
            </div>

            <div class="wall-status">
              <el-tag v-if="wall.isPublic" type="success" size="small">公開</el-tag>
              <el-tag v-else type="warning" size="small">私人</el-tag>
              <el-tag v-if="!wall.isActive" type="info" size="small">未啟用</el-tag>
            </div>
          </div>

          <div class="wall-card-footer">
            <el-button text type="primary">
              查看祝福牆
              <el-icon><ArrowRight /></el-icon>
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 創建祝福牆對話框 -->
    <CreateWallDialog 
      v-model="showCreateDialog"
      @created="handleWallCreated"
    />
  </div>
</template>

<script setup lang="ts">
import { 
  Plus, 
  SwitchButton, 
  Delete, 
  Message, 
  Calendar, 
  ArrowRight,
  User,
  MoreFilled,
  Edit,
  CopyDocument
} from '@element-plus/icons-vue'
import type { Wall } from '~/types/wall'
import CreateWallDialog from '~/components/CreateWallDialog.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const wallsStore = useWallsStore()

const userId = route.params.userId as string
const showCreateDialog = ref(false)
const avatarError = ref(false)

// 計算屬性
const walls = computed(() => wallsStore.getUserWalls(userId))

// 用戶顯示信息 - 處理編碼問題和提供安全的回退值
const userDisplayInfo = computed(() => {
  const profile = authStore.userProfile
  const isAuthenticated = authStore.isAuthenticated
  
  console.log('🔍 Computing userDisplayInfo:', {
    hasProfile: !!profile,
    isAuthenticated,
    profileKeys: profile ? Object.keys(profile) : [],
    name: profile?.name,
    email: profile?.email,
    picture: profile?.picture
  })
  
  // 如果沒有用戶資料或未認證，顯示載入狀態
  if (!profile || !isAuthenticated) {
    return {
      name: '載入中',
      email: '正在載入用戶資料...',
      picture: null
    }
  }
  
  // 確保文字正確編碼，防止亂碼
  const safeName = profile.name ? String(profile.name).trim() : '用戶'
  const safeEmail = profile.email ? String(profile.email).trim() : ''
  
  // 為 Google 頭像添加代理
  let avatarUrl = profile.picture || null
  if (avatarUrl && avatarUrl.includes('googleusercontent.com')) {
    avatarUrl = `/api/proxy/avatar?url=${encodeURIComponent(avatarUrl)}`
  }
  
  const result = {
    name: safeName || '用戶',
    email: safeEmail || '未提供郵箱',
    picture: avatarUrl
  }
  
  console.log('✅ User display info computed:', result)
  return result
})

// 監聽用戶變化，重置頭像錯誤狀態
watch(() => userDisplayInfo.value.picture, () => {
  avatarError.value = false
})

// 載入用戶的祝福牆（包含認證檢查）
onMounted(async () => {
  try {
    console.log('🎯 Walls page mounted, starting authentication check...')
    
    // 確保認證狀態已恢復
    const sessionRestored = authStore.restoreSession()
    console.log('🔄 Session restoration result:', sessionRestored)
    
    // 等待一個 tick 讓響應式系統更新
    await nextTick()
    
    // 再次檢查認證狀態，考慮到 Pinia 持久化可能需要時間
    let authCheckCount = 0
    const maxAuthChecks = 10
    
    while ((!authStore.isAuthenticated || !authStore.userId) && authCheckCount < maxAuthChecks) {
      console.log(`🔍 Auth check ${authCheckCount + 1}/${maxAuthChecks}:`, {
        isAuthenticated: authStore.isAuthenticated,
        userId: authStore.userId,
        userProfile: !!authStore.userProfile,
        accessToken: !!authStore.accessToken
      })
      
      await new Promise(resolve => setTimeout(resolve, 100))
      authCheckCount++
    }
    
    // 驗證用戶是否已登入且 userId 匹配
    if (!authStore.isAuthenticated || authStore.userId !== userId) {
      console.error('❌ Authentication failed after retries:', {
        isAuthenticated: authStore.isAuthenticated,
        storeUserId: authStore.userId,
        routeUserId: userId,
        hasAccessToken: !!authStore.accessToken,
        userProfile: authStore.userProfile
      })
      
      // 跳轉到登入頁
      await router.push('/auth/login?error=auth_required')
      return
    }
    
    console.log('✅ Authentication success:', {
      isAuthenticated: authStore.isAuthenticated,
      userId: authStore.userId,
      userProfile: authStore.userProfile
    })
    
    // 載入牆列表
    await wallsStore.fetchUserWalls(userId)
  } catch (error) {
    console.error('❌ Failed to load walls:', error)
  }
})

// 導航到特定祝福牆
function navigateToWall(wall: Wall) {
  router.push(`/${userId}/walls/${wall.id}`)
}

// 處理祝福牆操作
async function handleWallAction(command: string) {
  const [action, wallId] = command.split('-')
  
  switch (action) {
    case 'edit':
      // TODO: 實現編輯功能
      ElMessage.info('編輯功能即將推出')
      break
    case 'duplicate':
      // TODO: 實現複製功能
      ElMessage.info('複製功能即將推出')
      break
    case 'delete':
      await handleDeleteWall(wallId)
      break
  }
}

// 隱藏祝福牆（僅在UI上隱藏，不刪除MinIO數據）
async function handleDeleteWall(wallId: string) {
  try {
    await ElMessageBox.confirm(
      '確定要隱藏這個祝福牆嗎？此操作只會在界面上隱藏，不會刪除實際數據。',
      '隱藏祝福牆',
      {
        confirmButtonText: '確定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    // 只在UI上隱藏，不實際刪除MinIO數據
    wallsStore.hideWallFromUI(wallId)
    ElMessage.success('祝福牆已隱藏')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Hide wall failed:', error)
    }
  }
}

// 處理新祝福牆創建
function handleWallCreated(wall: Wall) {
  showCreateDialog.value = false
  // 可以選擇導航到新創建的祝福牆
  ElMessageBox.confirm(
    '祝福牆創建成功！是否立即前往查看？',
    '創建成功',
    {
      confirmButtonText: '立即查看',
      cancelButtonText: '稍後查看',
      type: 'success',
    }
  ).then(() => {
    navigateToWall(wall)
  }).catch(() => {
    // 用戶選擇稍後查看，不做任何操作
  })
}

// 格式化日期
function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('zh-TW')
}

// 處理頭像載入錯誤
function handleAvatarError(event: Event) {
  console.warn('Avatar failed to load:', userDisplayInfo.value.picture)
  // 設置錯誤狀態，這會觸發顯示占位符
  avatarError.value = true
}

// 登出
async function logout() {
  try {
    authStore.logout()
    await router.push('/auth/login')
  } catch (error) {
    console.error('Logout failed:', error)
  }
}

// 設定頁面標題
useHead({
  title: `${authStore.userProfile?.name || '用戶'}的祝福牆 - 婚禮祝福牆`,
  meta: [
    { name: 'description', content: '管理您的祝福牆，創建多個主題不同的祝福牆收集來自親朋好友的美好祝福' }
  ]
})
</script>

<style scoped>
.walls-page {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 2rem 1rem;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.user-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.user-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
}

.user-avatar-placeholder {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.user-info h1 {
  margin: 0 0 0.5rem 0;
  font-size: 1.8rem;
  color: #333;
}

.user-info p {
  margin: 0;
  color: #666;
}

.header-actions {
  margin-left: auto;
  display: flex;
  gap: 1rem;
  align-items: center;
}

.loading-container {
  text-align: center;
  padding: 3rem 0;
  color: #666;
}

.error-alert {
  margin-bottom: 2rem;
}

.empty-state {
  text-align: center;
  padding: 3rem 0;
}

.walls-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}

.wall-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.2s ease;
  cursor: pointer;
  overflow: hidden;
  border: 1px solid #f0f0f0;
}

.wall-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.wall-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1rem 0.5rem;
}

.wall-theme-indicator {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  border: 1px solid #ddd;
}

.theme-default {
  background: linear-gradient(45deg, #f5f7fa, #c3cfe2);
}

.theme-polaroid {
  background: linear-gradient(45deg, #fff, #f8f8f8);
  border: 2px solid #333;
}

.theme-instagram {
  background: linear-gradient(45deg, #833ab4, #fd1d1d, #fcb045);
}

.theme-magazine {
  background: linear-gradient(45deg, #2c3e50, #34495e);
}

.wall-card-body {
  padding: 0 1rem 1rem;
}

.wall-name {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  line-height: 1.4;
}

.wall-description {
  margin: 0 0 1rem 0;
  color: #666;
  font-size: 0.9rem;
  line-height: 1.4;
  min-height: 2.8rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.wall-stats {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: #666;
  font-size: 0.875rem;
}

.stat-item .el-icon {
  font-size: 14px;
}

.wall-status {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.wall-card-footer {
  padding: 0.75rem 1rem;
  border-top: 1px solid #f5f5f5;
  background: #fafafa;
}

.wall-card-footer .el-button {
  width: 100%;
  justify-content: space-between;
}

@media (max-width: 768px) {
  .walls-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .user-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .header-actions {
    margin-left: 0;
    width: 100%;
    justify-content: center;
  }
}
</style>