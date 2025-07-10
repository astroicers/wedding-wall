<template>
  <div class="wall-grid-page" data-page="wall-grid" :style="backgroundStyle">
    <!-- 返回按鈕 -->
    <div class="back-button-container">
      <div class="back-button" @click="navigateTo('/')">
        <el-icon size="20">
          <ArrowLeft />
        </el-icon>
        <span>返回首頁</span>
      </div>
    </div>
    
    <!-- 祝福牆標題 -->
    <div class="wall-header" v-if="messages.length > 0">
      <h1 class="wall-title" :style="{ 
        color: titleSettings.titleColor,
        fontFamily: getFontFamilyWithFallback(titleSettings.fontFamily),
        fontSize: titleSettings.fontSize + 'px'
      }">{{ titleSettings.wallTitle }}</h1>
      <p class="wall-subtitle" v-if="titleSettings.wallSubtitle" :style="{ 
        color: titleSettings.titleColor,
        fontFamily: getFontFamilyWithFallback(titleSettings.fontFamily),
        fontSize: (titleSettings.fontSize * 0.5) + 'px'
      }">{{ titleSettings.wallSubtitle }}</p>
    </div>
    
    <!-- 水平輪播祝福牆 -->
    <div class="wall-grid" v-if="messages.length > 0">
      <div class="carousel-container">
        <transition-group name="carousel" tag="div" class="cards-wrapper">
          <div 
            v-for="(message, index) in displayedMessages.slice(0, 3)" 
            :key="`card-${message.timestamp}-${index}`"
            class="card-slot"
            :class="`position-${index + 1}`"
          >
            <GridMessageCard 
              :message="message" 
              :size="getCardSize(index)"
              :is-active="index === 1"
            />
          </div>
        </transition-group>
      </div>
    </div>
    
    <!-- 空狀態 -->
    <div v-else class="empty-state">
      <el-icon size="64" color="rgba(255,255,255,0.8)">
        <Picture />
      </el-icon>
      <h3>還沒有祝福訊息</h3>
      <p>快去上傳第一則祝福吧！</p>
      <el-button type="primary" @click="navigateTo('/')">前往上傳</el-button>
    </div>
    
    <!-- QR Code 上傳按鈕 -->
    <QRCodeUpload />
  </div>
</template>

<script setup lang="ts">
import GridMessageCard from '~/components/GridMessageCard.vue'
import QRCodeUpload from '~/components/QRCodeUpload.vue'
import { ArrowLeft, Picture } from '@element-plus/icons-vue'
import { useGoogleFonts } from '~/composables/useGoogleFonts'

const currentIndex = ref(0)
const titleSettings = ref({
  wallTitle: '婚禮祝福牆',
  wallSubtitle: '',
  titleColor: '#ffffff',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  fontSize: 48
})

// 使用 Pinia Stores
const messagesStore = useMessagesStore()
const backgroundStore = useBackgroundStore()
const uiStore = useUIStore()

// 使用 Google Fonts 工具
const { isGoogleFont, getFontFamilyWithFallback, loadFont } = useGoogleFonts()

// 響應式資料
const messages = computed(() => messagesStore.messages)

// 設定頁面 meta
useHead({
  title: '網格祝福牆 - 婚禮祝福牆',
  meta: [
    { name: 'description', content: '5列網格式祝福牆，中間主體隨機輪播' }
  ]
})

// 背景樣式緩存，避免頻繁重新計算導致閃動
const cachedBackgroundStyle = ref({})
const lastBackgroundUrl = ref('')

// 計算背景樣式，使用緩存機制避免閃動
const backgroundStyle = computed(() => {
  const bgUrl = backgroundStore.cachedBackgroundUrl
  
  // 只有當背景URL真正改變時才更新樣式
  if (bgUrl && bgUrl !== lastBackgroundUrl.value) {
    lastBackgroundUrl.value = bgUrl
    cachedBackgroundStyle.value = {
      backgroundImage: `url(${bgUrl})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }
  }
  
  return cachedBackgroundStyle.value
})

// 計算當前顯示的三張卡片
const displayedMessages = computed(() => {
  if (messages.value.length === 0) return []
  if (messages.value.length === 1) return [messages.value[0]]
  if (messages.value.length === 2) return [...messages.value]
  
  // 確保只返回3張卡片
  const result = []
  for (let i = 0; i < 3; i++) {
    const messageIndex = (currentIndex.value - 1 + i + messages.value.length) % messages.value.length
    result.push(messages.value[messageIndex])
  }
  return result.slice(0, 3) // 確保最多只有3張
})

// 根據位置決定卡片大小
const getCardSize = (index: number) => {
  switch (index) {
    case 0: return 'medium' // 左邊
    case 1: return 'main'   // 中心（主圖）
    case 2: return 'medium' // 右邊
    default: return 'medium'
  }
}

// 自動輪播
let autoPlayTimer: NodeJS.Timeout | null = null

const startAutoPlay = () => {
  if (autoPlayTimer) clearInterval(autoPlayTimer)
  
  autoPlayTimer = setInterval(() => {
    if (messages.value.length > 0) {
      // 向左移動（索引增加）
      currentIndex.value = (currentIndex.value + 1) % messages.value.length
    }
  }, 2000) // 每2秒切換，實現不斷移動輪播
}

const stopAutoPlay = () => {
  if (autoPlayTimer) {
    clearInterval(autoPlayTimer)
    autoPlayTimer = null
  }
}

// 載入標題設定
const loadTitleSettings = () => {
  try {
    const settings = localStorage.getItem('wallTitleSettings')
    if (settings) {
      titleSettings.value = { ...titleSettings.value, ...JSON.parse(settings) }
      
      // 載入字體（如果需要）
      if (titleSettings.value.fontFamily) {
        loadFont(titleSettings.value.fontFamily)
      }
    }
  } catch (error) {
    console.error('載入標題設定失敗:', error)
  }
}

// 監聽標題設定變更
const handleTitleUpdated = (event: CustomEvent) => {
  titleSettings.value = { ...titleSettings.value, ...event.detail }
  
  // 載入字體（如果需要）
  if (event.detail.fontFamily) {
    loadFont(event.detail.fontFamily)
  }
}

onMounted(async () => {
  // 設定當前頁面
  uiStore.setCurrentPage('wall-grid')
  
  // 載入標題設定
  loadTitleSettings()
  
  // 使用 Pinia stores 載入資料
  await Promise.all([
    messagesStore.fetchMessages(),
    backgroundStore.loadBackground(true)
  ])
  
  // 開始自動輪播
  if (messages.value.length > 0) {
    startAutoPlay()
  }
  
  // 每5秒重新載入訊息（背景載入，不顯示錯誤）
  setInterval(() => {
    messagesStore.fetchMessages(false)
  }, 5000)
  
  // 每5分鐘重新檢查背景圖片是否有更新（減少頻率避免閃動）
  setInterval(() => {
    backgroundStore.loadBackground()
  }, 300000)
  
  // 監聽背景更新訊息
  const handleBackgroundUpdate = (event: MessageEvent) => {
    if (event.data && event.data.type === 'BACKGROUND_UPDATED') {
      // 強制重新載入背景
      backgroundStore.loadBackground(true)
    }
  }
  
  // 監聽標題設定變更
  window.addEventListener('wallTitleUpdated', handleTitleUpdated as EventListener)
  window.addEventListener('message', handleBackgroundUpdate)
  
  // 清理事件監聽器
  onUnmounted(() => {
    window.removeEventListener('wallTitleUpdated', handleTitleUpdated as EventListener)
    window.removeEventListener('message', handleBackgroundUpdate)
  })
})

onUnmounted(() => {
  stopAutoPlay()
})

// 監聽訊息變化
watch(() => messages.value.length, (newLength) => {
  if (newLength > 0) {
    startAutoPlay()
  } else {
    stopAutoPlay()
  }
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

/* 水平輪播容器 */
.wall-grid {
  flex: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0;
  box-sizing: border-box;
  position: relative;
}

.carousel-container {
  width: 100vw;
  height: 650px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  margin: 0;
  padding: 0;
}

.cards-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 40px;
  width: 100vw;
  height: 100%;
  position: relative;
  padding: 0 50px;
  box-sizing: border-box;
  max-width: 100vw;
  overflow: hidden;
}

.card-slot {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.8s cubic-bezier(0.4, 0.0, 0.2, 1);
  position: relative;
}

/* 位置1 - 左邊 */
.card-slot.position-1 {
  width: 400px;
  height: 500px;
  z-index: 2;
  opacity: 0.7;
  transform: scale(0.85);
}

/* 位置2 - 中心主圖 */
.card-slot.position-2 {
  width: 500px;
  height: 600px;
  z-index: 3;
  opacity: 1;
  transform: scale(1);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

/* 位置3 - 右邊 */
.card-slot.position-3 {
  width: 400px;
  height: 500px;
  z-index: 2;
  opacity: 0.7;
  transform: scale(0.85);
}

/* 隱藏第4張卡片以後的內容 */
.card-slot.position-4,
.card-slot.position-5,
.card-slot:nth-child(n+4) {
  display: none !important;
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

/* 輪播動畫效果 */
.carousel-enter-active {
  transition: all 1s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.carousel-leave-active {
  transition: all 1s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.carousel-enter-from {
  opacity: 0;
  transform: translateX(120px) scale(0.7);
}

.carousel-leave-to {
  opacity: 0;
  transform: translateX(-120px) scale(0.7);
}

.carousel-move {
  transition: all 1s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

/* 響應式設計 */
@media (max-width: 1200px) {
  .carousel-container {
    height: 550px;
  }
  
  .cards-wrapper {
    gap: 30px;
    padding: 0 30px;
  }
  
  .card-slot.position-1,
  .card-slot.position-3 {
    width: 320px;
    height: 420px;
  }
  
  .card-slot.position-2 {
    width: 400px;
    height: 500px;
  }
}

@media (max-width: 768px) {
  .wall-grid-page {
    padding: 0;
  }
  
  .carousel-container {
    height: 400px;
  }
  
  .cards-wrapper {
    gap: 20px;
    padding: 0 20px;
  }
  
  .card-slot.position-1,
  .card-slot.position-3 {
    width: 120px;
    height: 280px;
    opacity: 0.6;
  }
  
  .card-slot.position-2 {
    width: 280px;
    height: 350px;
  }
  
  .wall-title {
    font-size: 2rem;
  }
  
  .wall-subtitle {
    font-size: 1rem;
  }
  
  .back-button-container {
    position: absolute;
    top: 20px;
    left: 20px;
    opacity: 0;
    transform: translateX(-10px);
    transition: all 0.3s ease;
  }
  
  .wall-grid-page:hover .back-button-container {
    opacity: 1;
    transform: translateX(0);
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