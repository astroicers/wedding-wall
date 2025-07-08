<template>
  <div class="gallery-page">
    <!-- 導航欄 -->
    <div class="gallery-header">
      <el-button 
        @click="navigateBack" 
        :icon="ArrowLeft" 
        type="primary" 
        plain
        class="back-button"
      >
        返回祝福牆
      </el-button>
      
      <h1 class="gallery-title">{{ wall?.name }} - 相簿檢視</h1>
      
      <div class="gallery-actions">
        <el-button 
          @click="navigateToUpload" 
          :icon="Upload" 
          type="primary"
        >
          上傳祝福
        </el-button>
      </div>
    </div>

    <!-- 相簿內容 -->
    <div class="gallery-content">
      <div v-if="loading" class="loading-state">
        <el-skeleton :rows="3" animated />
        <el-skeleton :rows="3" animated />
        <el-skeleton :rows="3" animated />
      </div>
      
      <div v-else-if="messages && messages.length > 0" class="gallery-grid">
        <div 
          v-for="message in messages" 
          :key="message.id"
          class="gallery-item"
          @click="openImagePreview(message)"
        >
          <img
            :src="getImageUrl(message)"
            :alt="message.name"
            class="gallery-image"
          />
          <div class="gallery-overlay">
            <div class="gallery-info">
              <h3 class="gallery-name">{{ message.name }}</h3>
              <p class="gallery-text">{{ getMessageText(message) }}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div v-else class="empty-state">
        <div class="empty-content">
          <el-icon size="80" color="#cccccc">
            <Picture />
          </el-icon>
          <h3>還沒有祝福照片</h3>
          <p>快去上傳第一張祝福照片吧！</p>
          <el-button type="primary" @click="navigateToUpload">
            立即上傳
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft, Upload, Picture } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

// 路由參數
const userId = computed(() => route.params.userId as string)
const wallId = computed(() => route.params.wallId as string)

// 響應式數據
const loading = ref(true)
const messages = ref([])
const wall = ref(null)

// 使用消息兼容性助手
const { getMessageText, getImagePath } = useMessageCompat()

const getImageUrl = (message: any) => getImagePath(message)

// 載入數據
const loadData = async () => {
  try {
    loading.value = true
    
    // 載入祝福牆資訊
    const wallResponse = await $fetch(`/api/users/${userId.value}/walls/${wallId.value}`)
    if (wallResponse.success) {
      wall.value = wallResponse.wall
    }
    
    // 載入祝福消息
    const messagesResponse = await $fetch(`/api/users/${userId.value}/walls/${wallId.value}/messages`)
    if (messagesResponse.success) {
      messages.value = messagesResponse.messages || []
    }
  } catch (error) {
    console.error('載入相簿失敗:', error)
    ElMessage.error('載入相簿失敗')
  } finally {
    loading.value = false
  }
}

// 返回祝福牆
const navigateBack = () => {
  router.push(`/${userId.value}/walls/${wallId.value}`)
}

// 導航到上傳頁面
const navigateToUpload = () => {
  router.push(`/${userId.value}/walls/${wallId.value}/upload`)
}

// 打開圖片預覽
const openImagePreview = (message: any) => {
  const imageUrl = getImageUrl(message)
  if (imageUrl) {
    // 可以在這裡實現圖片預覽邏輯，比如使用 vue3-photo-preview
    console.log('Opening image preview for:', imageUrl)
  }
}

// 頁面載入時獲取數據
onMounted(() => {
  loadData()
})

// 設定頁面標題
useHead(() => ({
  title: `${wall.value?.name || '祝福牆'} - 相簿檢視`,
  meta: [
    { name: 'description', content: '瀏覽祝福牆中的所有照片' }
  ]
}))
</script>

<style scoped>
.gallery-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding-bottom: 2rem;
}

.gallery-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.gallery-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
}

.back-button {
  border-radius: 25px;
  font-weight: 600;
}

.gallery-content {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.loading-state {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.gallery-item {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
}

.gallery-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
}

.gallery-image {
  width: 100%;
  height: 250px;
  object-fit: cover;
  display: block;
}

.gallery-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  color: white;
  padding: 1rem;
  transform: translateY(100%);
  transition: transform 0.3s ease;
}

.gallery-item:hover .gallery-overlay {
  transform: translateY(0);
}

.gallery-name {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.gallery-text {
  margin: 0;
  font-size: 0.9rem;
  opacity: 0.9;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 50vh;
}

.empty-content {
  text-align: center;
  color: white;
}

.empty-content h3 {
  margin: 1rem 0 0.5rem 0;
  font-size: 1.5rem;
}

.empty-content p {
  margin: 0 0 1.5rem 0;
  opacity: 0.8;
}

@media (max-width: 768px) {
  .gallery-header {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }
  
  .gallery-title {
    font-size: 1.2rem;
  }
  
  .gallery-content {
    padding: 1rem;
  }
  
  .gallery-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1rem;
  }
}
</style>