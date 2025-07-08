<template>
  <div class="magazine-wall" data-page="wall-magazine" :style="backgroundStyle">
    <div class="back-button-container">
      <div class="back-button" @click="goBack">
        <el-icon size="20">
          <ArrowLeft />
        </el-icon>
        <span>返回</span>
      </div>
    </div>
    
    <div class="magazine-container" v-if="messages.length > 0">
      <div class="magazine-header">
        <div class="magazine-title">{{ wallSettings.wallTitle || 'Wedding Magazine' }}</div>
        <div class="magazine-subtitle">{{ wallSettings.wallSubtitle || 'A Beautiful Love Story' }}</div>
        <div class="magazine-date">{{ getCurrentDate() }}</div>
      </div>
      
      <!-- Magazine Spread -->
      <div class="magazine-spread">
      <div class="magazine-left-page">
        <div class="featured-photo" @click="openLightbox(currentMessage)">
          <img
            :src="`/api/image/${currentMessage.imagePath}`"
            :alt="currentMessage.name"
            class="featured-image"
          />
          <div class="photo-credit">Photo by {{ currentMessage.name }}</div>
        </div>
      </div>
      
      <div class="magazine-right-page">
        <h1 class="article-title">{{ currentMessage.name }}</h1>
        <div class="article-meta">
          <span class="date">{{ formatDate(currentMessage.createdAt) }}</span>
        </div>
        <p class="article-content">{{ currentMessage.message }}</p>
        
        <div class="thumbnail-grid">
          <div
            v-for="(msg, index) in thumbnails"
            :key="msg.id"
            class="thumbnail"
            :class="{ active: msg.id === currentMessage.id }"
            @click="selectMessage(index)"
          >
            <img
              :src="`/api/image/${msg.imagePath}`"
              :alt="msg.name"
              class="thumbnail-image"
            />
          </div>
        </div>
      </div>
      
      <!-- Navigation -->
      <button 
        v-if="currentIndex > 0"
        @click="previousMessage" 
        class="nav-button nav-prev"
      >
        <el-icon><ArrowLeft /></el-icon>
      </button>
      <button 
        v-if="currentIndex < messages.length - 1"
        @click="nextMessage" 
        class="nav-button nav-next"
      >
        <el-icon><ArrowRight /></el-icon>
      </button>
    </div>

    </div>
    
    <div v-else class="empty-state">
      <el-icon size="64" color="#8b5a3c">
        <Document />
      </el-icon>
      <h3>還沒有祝福訊息</h3>
      <p>快去上傳第一則祝福吧！</p>
      <el-button type="primary" @click="goBack">返回管理</el-button>
    </div>

    <!-- Lightbox -->
    <el-dialog
      v-model="lightboxVisible"
      :title="selectedMessage?.name"
      width="90%"
      top="5vh"
      class="lightbox-dialog"
    >
      <div v-if="selectedMessage" class="lightbox-content">
        <img
          :src="`/api/image/${selectedMessage.imagePath}`"
          :alt="selectedMessage.name"
          class="lightbox-image"
        />
        <div class="lightbox-info">
          <h3>{{ selectedMessage.name }}</h3>
          <p class="lightbox-message">{{ selectedMessage.message }}</p>
          <p class="lightbox-date">{{ formatDate(selectedMessage.createdAt) }}</p>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft, ArrowRight, Document } from '@element-plus/icons-vue'

interface Props {
  messages: any[]
  wallSettings: any
  wallId: string
  userId: string
}

const props = withDefaults(defineProps<Props>(), {
  messages: () => [],
  wallSettings: () => ({}),
  wallId: '',
  userId: ''
})

const router = useRouter()

const currentIndex = ref(0)
const lightboxVisible = ref(false)
const selectedMessage = ref(null)

const backgroundStyle = computed(() => {
  if (props.wallSettings.backgroundColor) {
    return { background: props.wallSettings.backgroundColor }
  }
  return { background: '#f8f6f0' }
})

const currentMessage = computed(() => props.messages[currentIndex.value] || {})

const thumbnails = computed(() => {
  const start = Math.max(0, currentIndex.value - 2)
  const end = Math.min(props.messages.length, start + 5)
  return props.messages.slice(start, end)
})

const formatDate = (timestamp) => {
  return new Date(timestamp).toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const selectMessage = (thumbnailIndex) => {
  const start = Math.max(0, currentIndex.value - 2)
  currentIndex.value = start + thumbnailIndex
}

const previousMessage = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
  }
}

const nextMessage = () => {
  if (currentIndex.value < props.messages.length - 1) {
    currentIndex.value++
  }
}

const openLightbox = (message) => {
  selectedMessage.value = message
  lightboxVisible.value = true
}

const goBack = () => {
  router.push(`/${props.userId}/walls/${props.wallId}`)
}

const getCurrentDate = () => {
  return new Date().toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// 自動輪播
onMounted(() => {
  if (props.messages.length > 0) {
    const interval = setInterval(() => {
      currentIndex.value = (currentIndex.value + 1) % props.messages.length
    }, 6000) // 每6秒切換
    
    onUnmounted(() => {
      clearInterval(interval)
    })
  }
})

useHead({
  title: 'Magazine 祝福牆 - 婚禮祝福牆',
  meta: [
    { name: 'description', content: '雜誌風格祝福牆，優雅版面設計' }
  ]
})
</script>

<style scoped>
.magazine-wall {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #f8f6f0;
  font-family: 'Georgia', 'Times New Roman', serif;
  margin: 0;
  padding: 0;
  z-index: 1;
}

.back-button-container {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 1000;
  opacity: 0;
  transform: translateX(-10px);
  transition: all 0.3s ease;
}

.magazine-wall:hover .back-button-container {
  opacity: 1;
  transform: translateX(0);
}

.back-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.95);
  color: #8b5a3c;
  border-radius: 25px;
  cursor: pointer;
  border: 1px solid #d4b896;
  box-shadow: 0 4px 15px rgba(139, 90, 60, 0.2);
  transition: all 0.3s ease;
}

.back-button:hover {
  background: white;
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(139, 90, 60, 0.3);
}

.magazine-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.magazine-header {
  text-align: center;
  padding: 2rem 2rem 1rem;
  background: linear-gradient(135deg, #f8f6f0 0%, #e8e0d0 100%);
  border-bottom: 3px solid #d4b896;
}

.magazine-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2c1810;
  margin-bottom: 0.5rem;
  letter-spacing: 2px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
}

.magazine-subtitle {
  font-size: 1rem;
  color: #8b5a3c;
  font-style: italic;
  margin-bottom: 0.5rem;
  letter-spacing: 1px;
}

.magazine-date {
  font-size: 0.8rem;
  color: #a67c52;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* Loading State */
.loading-magazine {
  width: 100%;
  max-width: 1200px;
}

.skeleton-spread {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  background: white;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  min-height: 600px;
}

.skeleton-main {
  width: 100%;
  height: 100%;
}

.skeleton-sidebar {
  padding: 60px;
}

/* Magazine Spread */
.magazine-spread {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: white;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  position: relative;
  margin: 2rem;
  border-radius: 8px;
  overflow: hidden;
}

.magazine-left-page {
  position: relative;
  overflow: hidden;
  background: #000;
}

.featured-photo {
  width: 100%;
  height: 100%;
  cursor: pointer;
  position: relative;
}

.featured-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.featured-photo:hover .featured-image {
  transform: scale(1.05);
}

.photo-credit {
  position: absolute;
  bottom: 20px;
  left: 20px;
  color: white;
  font-size: 12px;
  background: rgba(0, 0, 0, 0.5);
  padding: 5px 10px;
  border-radius: 4px;
}

.magazine-right-page {
  padding: 60px;
  display: flex;
  flex-direction: column;
}

.article-title {
  font-size: 36px;
  margin: 0 0 10px 0;
  font-weight: 300;
  letter-spacing: -1px;
  color: #333;
}

.article-meta {
  color: #999;
  font-size: 14px;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.article-content {
  flex: 1;
  font-size: 16px;
  line-height: 1.8;
  color: #666;
  white-space: pre-wrap;
  overflow-y: auto;
  margin-bottom: 30px;
}

.thumbnail-grid {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: auto;
}

.thumbnail {
  width: 60px;
  height: 60px;
  cursor: pointer;
  opacity: 0.6;
  transition: all 0.3s ease;
  overflow: hidden;
  border: 2px solid transparent;
}

.thumbnail.active {
  opacity: 1;
  border-color: #409eff;
}

.thumbnail:hover {
  opacity: 1;
  transform: scale(1.1);
}

.thumbnail-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Navigation */
.nav-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 50px;
  height: 50px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  font-size: 20px;
}

.nav-button:hover {
  background: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.nav-prev {
  left: -25px;
}

.nav-next {
  right: -25px;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #8b5a3c;
  text-align: center;
  gap: 20px;
}

.empty-state h3 {
  font-size: 2rem;
  margin: 0;
  font-weight: 600;
}

.empty-state p {
  font-size: 1.2rem;
  margin: 0;
  opacity: 0.8;
}

/* Lightbox */
.lightbox-dialog :deep(.el-dialog__body) {
  padding: 0;
}

.lightbox-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.lightbox-image {
  max-width: 100%;
  max-height: 70vh;
  object-fit: contain;
  margin-bottom: 20px;
}

.lightbox-info {
  padding: 20px;
  text-align: center;
  width: 100%;
}

.lightbox-info h3 {
  margin: 0 0 10px 0;
  font-size: 20px;
  color: #333;
}

.lightbox-message {
  font-size: 16px;
  line-height: 1.6;
  color: #666;
  margin: 10px 0;
  white-space: pre-wrap;
}

.lightbox-date {
  font-size: 14px;
  color: #999;
  margin-top: 10px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .magazine-spread {
    grid-template-columns: 1fr;
    max-width: 100%;
  }
  
  .magazine-left-page {
    height: 300px;
  }
  
  .magazine-right-page {
    padding: 30px;
  }
  
  .article-title {
    font-size: 24px;
  }
  
  .article-content {
    font-size: 14px;
  }
  
  .nav-button {
    width: 40px;
    height: 40px;
    font-size: 16px;
  }
  
  .nav-prev {
    left: 10px;
  }
  
  .nav-next {
    right: 10px;
  }
}
</style>