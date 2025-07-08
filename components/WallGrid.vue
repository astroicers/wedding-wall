<template>
  <div class="wall-grid-page" data-page="wall-grid" :style="backgroundStyle">
    <!-- 返回按鈕 -->
    <div class="back-button-container">
      <div class="back-button" @click="goBack">
        <el-icon size="20">
          <ArrowLeft />
        </el-icon>
        <span>返回</span>
      </div>
    </div>
    
    <!-- 祝福牆標題 -->
    <div class="wall-header" v-if="messages.length > 0">
      <h1 class="wall-title" :style="titleStyle">{{ wallSettings.wallTitle || '網格祝福牆' }}</h1>
      <p class="wall-subtitle" v-if="wallSettings.wallSubtitle" :style="subtitleStyle">{{ wallSettings.wallSubtitle }}</p>
    </div>
    
    <!-- 相簿風格祝福牆 -->
    <div class="wall-grid" v-if="messages.length > 0">
      <div class="album-container">
        <!-- 位置4 - 小圖 -->
        <div class="side-thumbnails position-4">
          <transition name="fade-slide" mode="out-in">
            <div v-if="position4Message" :key="`pos4-${currentIndex}`" class="thumbnail-wrapper">
              <GridMessageCard 
                :message="position4Message" 
                size="small"
                :is-active="false"
              />
            </div>
          </transition>
        </div>
        
        <!-- 位置2 - 中圖 -->
        <div class="side-thumbnails position-2">
          <transition name="fade-slide" mode="out-in">
            <div v-if="position2Message" :key="`pos2-${currentIndex}`" class="thumbnail-wrapper">
              <GridMessageCard 
                :message="position2Message" 
                size="medium"
                :is-active="false"
              />
            </div>
          </transition>
        </div>
        
        <!-- 位置1 - 主圖（大） -->
        <div class="main-photo">
          <transition name="photo-transition" mode="out-in">
            <div v-if="mainMessage" :key="`main-${currentIndex}`" class="main-wrapper">
              <GridMessageCard 
                :message="mainMessage" 
                size="main"
                :is-active="true"
              />
            </div>
          </transition>
        </div>
        
        <!-- 位置3 - 中圖 -->
        <div class="side-thumbnails position-3">
          <transition name="fade-slide" mode="out-in">
            <div v-if="position3Message" :key="`pos3-${currentIndex}`" class="thumbnail-wrapper">
              <GridMessageCard 
                :message="position3Message" 
                size="medium"
                :is-active="false"
              />
            </div>
          </transition>
        </div>
        
        <!-- 位置5 - 小圖 -->
        <div class="side-thumbnails position-5">
          <transition name="fade-slide" mode="out-in">
            <div v-if="position5Message" :key="`pos5-${currentIndex}`" class="thumbnail-wrapper">
              <GridMessageCard 
                :message="position5Message" 
                size="small"
                :is-active="false"
              />
            </div>
          </transition>
        </div>
      </div>
    </div>
    
    <!-- 空狀態 -->
    <div v-else class="empty-state">
      <el-icon size="64" color="rgba(255,255,255,0.8)">
        <Picture />
      </el-icon>
      <h3>還沒有祝福訊息</h3>
      <p>快去上傳第一則祝福吧！</p>
      <el-button type="primary" @click="goBack">返回管理</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import GridMessageCard from '~/components/GridMessageCard.vue'
import { ArrowLeft, Picture } from '@element-plus/icons-vue'
import { useGoogleFonts } from '~/composables/useGoogleFonts'

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

// 使用 Google Fonts 工具
const { getFontFamilyWithFallback, loadFont } = useGoogleFonts()

// 背景樣式
const backgroundStyle = computed(() => {
  if (props.wallSettings.backgroundColor) {
    return {
      background: props.wallSettings.backgroundColor
    }
  }
  return {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  }
})

// 標題樣式
const titleStyle = computed(() => ({
  color: props.wallSettings.textColor || '#ffffff',
  fontFamily: getFontFamilyWithFallback(props.wallSettings.fontFamily || 'Inter, sans-serif'),
  fontSize: (props.wallSettings.fontSize || 48) + 'px'
}))

const subtitleStyle = computed(() => ({
  color: props.wallSettings.textColor || '#ffffff',
  fontFamily: getFontFamilyWithFallback(props.wallSettings.fontFamily || 'Inter, sans-serif'),
  fontSize: ((props.wallSettings.fontSize || 48) * 0.5) + 'px'
}))

// 計算當前顯示的訊息組合
const mainMessage = computed(() => {
  return props.messages[currentIndex.value] || null
})

const position2Message = computed(() => {
  if (props.messages.length <= 1) return null
  const prevIndex = (currentIndex.value - 1 + props.messages.length) % props.messages.length
  return props.messages[prevIndex] || null
})

const position3Message = computed(() => {
  if (props.messages.length <= 1) return null
  const nextIndex = (currentIndex.value + 1) % props.messages.length
  return props.messages[nextIndex] || null
})

const position4Message = computed(() => {
  if (props.messages.length <= 2) return null
  const prevIndex = (currentIndex.value - 2 + props.messages.length) % props.messages.length
  return props.messages[prevIndex] || null
})

const position5Message = computed(() => {
  if (props.messages.length <= 2) return null
  const nextIndex = (currentIndex.value + 2) % props.messages.length
  return props.messages[nextIndex] || null
})

// 返回功能
const goBack = () => {
  router.push(`/${props.userId}/walls/${props.wallId}`)
}

// 自動輪播
onMounted(() => {
  // 載入字體
  if (props.wallSettings.fontFamily) {
    loadFont(props.wallSettings.fontFamily)
  }
  
  // 開始自動輪播
  if (props.messages.length > 0) {
    const interval = setInterval(() => {
      currentIndex.value = (currentIndex.value + 1) % props.messages.length
    }, 4000) // 每4秒切換
    
    onUnmounted(() => {
      clearInterval(interval)
    })
  }
})

// 設定頁面 meta
useHead({
  title: '網格祝福牆 - 婚禮祝福牆',
  meta: [
    { name: 'description', content: '5列網格式祝福牆，中間主體隨機輪播' }
  ]
})
</script>

<style scoped>
.wall-grid-page {
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 0;
  box-sizing: border-box;
  outline: none;
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  background-attachment: fixed;
  transition: background-image 0.5s ease-in-out;
}

/* 返回按鈕容器 - 隱藏區域 */
.back-button-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 120px;
  height: 80px;
  z-index: 1000;
}

.back-button-container:hover .back-button {
  opacity: 1;
  transform: translate(0, 0);
}

.back-button {
  position: absolute;
  top: 20px;
  left: 20px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.9);
  cursor: pointer;
  padding: 0.75rem 1rem;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 25px;
  transition: all 0.3s ease;
  opacity: 0;
  transform: translate(-20px, -10px);
}

.back-button:hover {
  color: white;
  background: rgba(0, 0, 0, 0.7);
}

.back-button span {
  font-size: 0.9rem;
  font-weight: 500;
}

/* 標題區域 */
.wall-header {
  position: relative;
  text-align: center;
  padding: 2rem 0 1rem;
  background: rgba(0, 0, 0, 0.3);
  width: 100vw;
  margin: 0;
}

.wall-title {
  margin: 0;
  font-weight: bold;
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.4);
  letter-spacing: 2px;
}

.wall-subtitle {
  margin: 0.5rem 0 0;
  opacity: 0.9;
  text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.4);
}

/* 相簿容器 */
.wall-grid {
  flex: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  box-sizing: border-box;
  position: relative;
}

.album-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 600px;
  position: relative;
  overflow: visible;
  width: 100vw;
  margin: 0 auto;
}

/* 側邊縮圖 */
.side-thumbnails {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

/* 位置2和3 - 中圖 */
.side-thumbnails.position-2,
.side-thumbnails.position-3 {
  flex: 0 0 520px;
  z-index: 2;
}

.side-thumbnails.position-2 {
  margin-right: -173px;
}

.side-thumbnails.position-3 {
  margin-left: -173px;
}

/* 位置4和5 - 小圖 */
.side-thumbnails.position-4,
.side-thumbnails.position-5 {
  flex: 0 0 390px;
  z-index: 1;
}

.side-thumbnails.position-4 {
  margin-right: -260px;
}

.side-thumbnails.position-5 {
  margin-left: -260px;
}

.thumbnail-wrapper {
  transition: all 0.3s ease;
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  overflow: hidden;
  opacity: 1 !important;
}

/* 主圖區域 */
.main-photo {
  flex: 0 0 650px;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 3;
  position: relative;
}

.main-wrapper {
  transform: scale(1);
  transition: all 0.4s ease;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  overflow: hidden;
  opacity: 1 !important;
}

/* 空狀態 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100vh;
  text-align: center;
  color: rgba(255, 255, 255, 0.9);
  gap: 1rem;
  background: rgba(0, 0, 0, 0.3);
}

.empty-state h3 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.empty-state p {
  margin: 0;
  font-size: 1rem;
  opacity: 0.8;
}

/* 動畫效果 - 由左至右移動 */
.photo-transition-enter-active,
.photo-transition-leave-active {
  transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.photo-transition-enter-from {
  opacity: 0;
  transform: translateX(100px);
}

.photo-transition-leave-to {
  opacity: 0;
  transform: translateX(-100px);
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.fade-slide-enter-from {
  opacity: 0.8;
  transform: translateX(100px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-100px);
}

/* 響應式設計 */
@media (max-width: 1200px) {
  .album-container {
    gap: 2rem;
  }
  
  .side-thumbnails {
    flex: 0 0 150px;
  }
  
  .main-photo {
    flex: 0 0 400px;
  }
}

@media (max-width: 768px) {
  .wall-grid-page {
    padding: 1rem;
  }
  
  .album-container {
    flex-direction: column;
    gap: 1.5rem;
  }
  
  .side-thumbnails {
    display: none;
  }
  
  .main-photo {
    flex: 1;
    width: 100%;
    max-width: 400px;
  }
  
  .wall-title {
    font-size: 2rem;
  }
  
  .wall-subtitle {
    font-size: 1rem;
  }
  
  .back-button-container {
    position: relative;
    top: auto;
    left: auto;
    opacity: 1;
    margin-bottom: 1rem;
  }
}

/* 移除滾動條 */
.wall-grid-page {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.wall-grid-page::-webkit-scrollbar {
  display: none;
}

/* 移除所有點擊選取效果 */
.wall-grid-page *,
.wall-grid-page *:before,
.wall-grid-page *:after {
  outline: none !important;
  -webkit-tap-highlight-color: transparent !important;
  -webkit-touch-callout: none !important;
  -webkit-user-select: none !important;
  -khtml-user-select: none !important;
  -moz-user-select: none !important;
  -ms-user-select: none !important;
  user-select: none !important;
  -webkit-appearance: none !important;
  -moz-appearance: none !important;
  appearance: none !important;
}

.wall-grid-page *:focus,
.wall-grid-page *:active,
.wall-grid-page *:hover {
  outline: none !important;
  -webkit-tap-highlight-color: transparent !important;
}
</style>