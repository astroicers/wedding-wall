<template>
  <div class="walls-page">
    <div class="container">
      <!-- 用戶資訊 -->
      <div class="user-header">
        <img 
          v-if="authStore.userProfile?.picture" 
          :src="authStore.userProfile.picture" 
          :alt="authStore.userProfile.name"
          class="user-avatar"
        >
        <div class="user-info">
          <h1>{{ authStore.userProfile?.name || '用戶' }}的祝福牆</h1>
          <p>{{ authStore.userProfile?.email }}</p>
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
            <el-dropdown trigger="click" @command="handleWallAction">
              <el-button text>
                <el-icon><MoreFilled /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item :command="`edit-${wall.id}`">編輯設定</el-dropdown-item>
                  <el-dropdown-item :command="`duplicate-${wall.id}`">複製祝福牆</el-dropdown-item>
                  <el-dropdown-item :command="`delete-${wall.id}`" divided>刪除</el-dropdown-item>
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
  MoreFilled, 
  Message, 
  Calendar, 
  ArrowRight 
} from '@element-plus/icons-vue'
import type { Wall } from '~/types/wall'
import CreateWallDialog from '~/components/CreateWallDialog.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const wallsStore = useWallsStore()

const userId = route.params.userId as string
const showCreateDialog = ref(false)

// 計算屬性
const walls = computed(() => wallsStore.getUserWalls(userId))

// 載入用戶的祝福牆（包含認證檢查）
onMounted(async () => {
  try {
    // 確保認證狀態已恢復
    authStore.restoreSession()
    
    // 驗證用戶是否已登入且 userId 匹配
    if (!authStore.isAuthenticated || authStore.userId !== userId) {
      console.error('Authentication failed:', {
        isAuthenticated: authStore.isAuthenticated,
        storeUserId: authStore.userId,
        routeUserId: userId,
        hasAccessToken: !!authStore.accessToken
      })
      
      // 跳轉到登入頁
      await router.push('/auth/login?error=auth_required')
      return
    }
    
    console.log('Authentication success:', {
      isAuthenticated: authStore.isAuthenticated,
      userId: authStore.userId
    })
    
    // 載入牆列表
    await wallsStore.fetchUserWalls(userId)
  } catch (error) {
    console.error('Failed to load walls:', error)
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

// 刪除祝福牆
async function handleDeleteWall(wallId: string) {
  try {
    await ElMessageBox.confirm(
      '確定要刪除這個祝福牆嗎？此操作無法撤銷。',
      '確認刪除',
      {
        confirmButtonText: '確定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    await wallsStore.deleteWall(wallId)
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Delete wall failed:', error)
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