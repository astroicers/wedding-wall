<template>
  <div class="upload-page">
    <!-- Header -->
    <div class="upload-header">
      <el-button 
        @click="navigateBack" 
        :icon="ArrowLeft" 
        type="primary" 
        plain
        class="back-button"
      >
        返回祝福墻
      </el-button>
      
      <h1 class="upload-title">上傳祝福</h1>
      
      <div v-if="currentWall" class="wall-info">
        <span class="wall-name">{{ currentWall.name }}</span>
        <el-tag type="success">{{ currentWall.settings.displayMode }}</el-tag>
      </div>
    </div>

    <!-- Upload Form -->
    <div class="upload-content">
      <UploadForm 
        :wall-id="wallId" 
        @upload-success="handleUploadSuccess"
      />
    </div>
  </div>
</template>

<script setup>
import { ArrowLeft } from '@element-plus/icons-vue'
import { useRoute, useRouter } from 'vue-router'
import { useWallsStore } from '~/stores/walls'
import { useAuthStore } from '~/stores/auth'

const route = useRoute()
const router = useRouter()
const wallsStore = useWallsStore()
const authStore = useAuthStore()

// 從查詢參數獲取 wallId
const wallId = computed(() => route.query.wallId)
const currentWall = ref(null)
const loading = ref(true)

// 頁面初始化
onMounted(async () => {
  console.log('Upload page mounted:', {
    wallId: wallId.value,
    query: route.query,
    isAuthenticated: authStore.isAuthenticated
  })

  try {
    // 檢查認證
    if (!authStore.isAuthenticated) {
      const sessionRestored = authStore.restoreSession()
      if (!sessionRestored) {
        router.push('/auth/login')
        return
      }
    }

    // 檢查是否有 wallId
    if (!wallId.value) {
      ElMessage.error('缺少祝福墻 ID')
      router.push(`/${authStore.userId}/walls`)
      return
    }

    // 獲取墻列表以查找當前墻
    await wallsStore.fetchUserWalls(authStore.userId)
    currentWall.value = wallsStore.walls.find(w => w.id === wallId.value)

    if (!currentWall.value) {
      ElMessage.error('找不到指定的祝福墻')
      router.push(`/${authStore.userId}/walls`)
      return
    }

    // 檢查用戶權限
    if (currentWall.value.userId !== authStore.userId) {
      ElMessage.error('無權上傳到此祝福墻')
      router.push(`/${authStore.userId}/walls`)
      return
    }

  } catch (error) {
    console.error('Failed to load upload page:', error)
    ElMessage.error('載入失敗')
    router.push(`/${authStore.userId}/walls`)
  } finally {
    loading.value = false
  }
})

// 返回到祝福墻
const navigateBack = (shouldRefresh = false) => {
  if (currentWall.value) {
    const query = shouldRefresh ? { refresh: 'true' } : {}
    router.push({ path: `/${authStore.userId}/walls/${wallId.value}`, query })
  } else {
    router.push(`/${authStore.userId}/walls`)
  }
}

// 處理上傳成功
const handleUploadSuccess = () => {
  ElMessage.success('上傳成功！')
  // 返回到祝福墻頁面並刷新數據
  setTimeout(() => {
    navigateBack(true) // 傳入 true 以觸發數據刷新
  }, 1500)
}
</script>

<style scoped>
.upload-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.upload-header {
  background: white;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.back-button {
  margin-bottom: 15px;
}

.upload-title {
  font-size: 28px;
  margin: 0 0 10px 0;
  color: #333;
}

.wall-info {
  display: flex;
  align-items: center;
  gap: 15px;
  color: #666;
  font-size: 14px;
}

.wall-name {
  font-weight: 500;
  color: #333;
}

.upload-content {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

/* Responsive Design */
@media (max-width: 768px) {
  .upload-header {
    padding: 15px;
  }
  
  .upload-title {
    font-size: 20px;
  }
  
  .upload-content {
    padding: 15px;
  }
  
  .wall-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>