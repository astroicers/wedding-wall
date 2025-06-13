<template>
  <div class="wall-page" data-page="wall" :style="backgroundStyle">
    <!-- 返回按鈕 -->
    <div class="back-button-container">
      <div class="back-button" @click="navigateTo('/')">
        <el-icon size="20">
          <ArrowLeft />
        </el-icon>
        <span>返回首頁</span>
      </div>
    </div>
    
    <!-- 祝福牆內容 -->
    <div class="wall" v-if="messages.length > 0">
      <!-- Swiper 輪播 -->
      <swiper
        :modules="modules"
        :slides-per-view="1"
        :space-between="0"
        :autoplay="autoplayConfig"
        :pagination="{ 
          clickable: true,
          renderBullet: renderPaginationBullet
        }"
        :navigation="{
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev'
        }"
        :effect="'fade'"
        :fade-effect="{ crossFade: true }"
        :keyboard="{ enabled: true }"
        :loop="true"
        :grab-cursor="true"
        @swiper="onSwiper"
        @slide-change="onSlideChange"
        @autoplay-pause="onAutoplayPause"
        @autoplay-resume="onAutoplayResume"
        class="message-swiper"
      >
        <swiper-slide v-for="(message, index) in messages" :key="`${message.timestamp}-${index}`">
          <InstagramPost :message="message" />
        </swiper-slide>
        
        <!-- 自定義導航按鈕 -->
        <div class="swiper-button-prev custom-nav-button">
          <el-icon size="24"><ArrowLeft /></el-icon>
        </div>
        <div class="swiper-button-next custom-nav-button">
          <el-icon size="24"><ArrowRight /></el-icon>
        </div>
      </swiper>
      
      <!-- 簡潔的頁面指示器 -->
      <div class="page-indicator" v-if="showIndicator && messages.length > 1">
        <span class="counter">{{ currentIndex + 1 }} / {{ messages.length }}</span>
      </div>
      
      <!-- 控制面板 -->
      <div 
        class="control-panel" 
        :class="{ 'visible': showControls || isControlsForced }"
        @mouseenter="showControls = true"
        @mouseleave="showControls = false"
      >
        <el-button 
          circle 
          @click="toggleAutoplay"
          :type="isPaused ? 'primary' : 'default'"
          size="large"
        >
          <el-icon size="20">
            <VideoPause v-if="!isPaused" />
            <VideoPlay v-else />
          </el-icon>
        </el-button>
        
        <el-button 
          circle 
          @click="toggleIndicator"
          :type="showIndicator ? 'primary' : 'default'"
          size="large"
        >
          <el-icon size="20">
            <Promotion />
          </el-icon>
        </el-button>
        
        <el-button 
          circle 
          @click="changeEffect"
          size="large"
        >
          <el-icon size="20">
            <MagicStick />
          </el-icon>
        </el-button>
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
  </div>
</template>

<script setup lang="ts">
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Navigation, Pagination, Autoplay, EffectFade, EffectCube, EffectFlip, Keyboard } from 'swiper/modules'
import InstagramPost from '~/components/InstagramPost.vue'
import { 
  ArrowLeft, 
  ArrowRight, 
  Picture, 
  VideoPause, 
  VideoPlay, 
  Promotion,
  MagicStick
} from '@element-plus/icons-vue'

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/autoplay'
import 'swiper/css/effect-fade'
import 'swiper/css/effect-cube'
import 'swiper/css/effect-flip'

const modules = [Navigation, Pagination, Autoplay, EffectFade, EffectCube, EffectFlip, Keyboard]

// Pinia Stores
const messagesStore = useMessagesStore()
const backgroundStore = useBackgroundStore()
const uiStore = useUIStore()

// 響應式資料
const messages = computed(() => messagesStore.messages)
const swiperInstance = ref(null)
const currentIndex = ref(0)
const isPaused = ref(false)
const showControls = ref(false)
const isControlsForced = ref(false)
const showIndicator = ref(true)
const currentEffect = ref('fade')

// 動態切換時間配置
const getDynamicDelay = (message: any) => {
  if (!message) return 3000
  
  let baseTime = 3000 // 基礎時間 3秒
  
  // 根據文字長度調整
  if (message.text && message.text.length > 50) {
    baseTime += 2000 // 長文字 +2秒
  }
  
  // 有照片時增加時間
  if (message.photo) {
    baseTime += 1000 // 有照片 +1秒
  }
  
  return Math.min(baseTime, 8000) // 最多8秒
}

// 自動播放配置
const autoplayConfig = computed(() => ({
  delay: getDynamicDelay(messages.value[currentIndex.value]),
  disableOnInteraction: false,
  pauseOnMouseEnter: true,
}))

// 計算背景樣式
const backgroundStyle = computed(() => {
  const bgUrl = backgroundStore.cachedBackgroundUrl
  if (bgUrl) {
    return {
      backgroundImage: `url(${bgUrl})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }
  }
  return {}
})

// 自定義分頁指示器
const renderPaginationBullet = (index: number, className: string) => {
  return `<span class="${className} custom-bullet">${index + 1}</span>`
}

// Swiper 事件處理
const onSwiper = (swiper: any) => {
  swiperInstance.value = swiper
}

const onSlideChange = (swiper: any) => {
  currentIndex.value = swiper.realIndex
  handleSlideChange()
}

const onAutoplayPause = () => {
  isPaused.value = true
}

const onAutoplayResume = () => {
  isPaused.value = false
}

// 控制功能
const toggleAutoplay = () => {
  if (swiperInstance.value) {
    if (isPaused.value) {
      swiperInstance.value.autoplay.start()
    } else {
      swiperInstance.value.autoplay.stop()
    }
  }
}

const toggleIndicator = () => {
  showIndicator.value = !showIndicator.value
}

const changeEffect = () => {
  const effects = ['fade', 'cube', 'flip']
  const currentIdx = effects.indexOf(currentEffect.value)
  const nextIdx = (currentIdx + 1) % effects.length
  currentEffect.value = effects[nextIdx]
  
  // 重新初始化 swiper 以應用新效果
  if (swiperInstance.value) {
    swiperInstance.value.changeEffect(currentEffect.value)
  }
  
  ElMessage.success(`切換到 ${currentEffect.value} 效果`)
}

// 簡化的頁面切換處理
const handleSlideChange = () => {
  // 可以在這裡添加切換時的額外邏輯
}

// 鍵盤控制
const handleKeydown = (event: KeyboardEvent) => {
  switch (event.key) {
    case ' ':
      event.preventDefault()
      toggleAutoplay()
      break
    case 'i':
    case 'I':
      toggleIndicator()
      break
    case 'c':
    case 'C':
      isControlsForced.value = !isControlsForced.value
      break
  }
}

// 設定頁面 meta
useHead({
  title: '增強祝福牆 - 婚禮祝福牆',
  meta: [
    { name: 'description', content: '增強版祝福牆，支援多種轉場效果和互動控制' }
  ]
})

onMounted(async () => {
  // 設定當前頁面
  uiStore.setCurrentPage('wall')
  
  // 載入資料
  await Promise.all([
    messagesStore.fetchMessages(),
    backgroundStore.loadBackground(true)
  ])
  
  // 初始化完成
  
  // 定期更新資料
  const dataInterval = setInterval(() => {
    messagesStore.fetchMessages(false)
  }, 5000)
  
  const backgroundInterval = setInterval(() => {
    backgroundStore.loadBackground()
  }, 30000)
  
  // 監聽鍵盤事件
  document.addEventListener('keydown', handleKeydown)
  
  // 監聽背景更新
  const handleBackgroundUpdate = (event: MessageEvent) => {
    if (event.data && event.data.type === 'BACKGROUND_UPDATED') {
      backgroundStore.loadBackground(true)
    }
  }
  window.addEventListener('message', handleBackgroundUpdate)
  
  // 清理
  onUnmounted(() => {
    clearInterval(dataInterval)
    clearInterval(backgroundInterval)
    document.removeEventListener('keydown', handleKeydown)
    window.removeEventListener('message', handleBackgroundUpdate)
  })
})
</script>

<style scoped>
.wall-page {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  transition: all 0.5s ease;
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

.wall-page:hover .back-button-container {
  opacity: 1;
  transform: translateX(0);
}

.back-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border-radius: 25px;
  cursor: pointer;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.back-button:hover {
  background: rgba(0, 0, 0, 0.7);
  transform: scale(1.05);
}

.wall {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.message-swiper {
  flex: 1;
  width: 100%;
  height: 100%;
}

.custom-nav-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 50px !important;
  height: 50px !important;
  border-radius: 50% !important;
  background: rgba(0, 0, 0, 0.5) !important;
  color: white !important;
  border: 2px solid rgba(255, 255, 255, 0.3) !important;
  backdrop-filter: blur(10px);
  opacity: 0;
  transition: all 0.3s ease !important;
  z-index: 10;
}

.wall:hover .custom-nav-button {
  opacity: 1;
}

.custom-nav-button:hover {
  background: rgba(0, 0, 0, 0.8) !important;
  transform: translateY(-50%) scale(1.1);
}

.swiper-button-prev {
  left: 30px !important;
}

.swiper-button-next {
  right: 30px !important;
}

.custom-nav-button::after {
  display: none;
}

.page-indicator {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 10;
  opacity: 0.9;
  transition: all 0.3s ease;
}

.page-indicator:hover {
  opacity: 1;
  transform: scale(1.05);
}

.counter {
  display: inline-block;
  padding: 8px 16px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.control-panel {
  position: absolute;
  bottom: 20px;
  right: 20px;
  display: flex;
  gap: 10px;
  opacity: 0;
  transform: translateY(10px);
  transition: all 0.3s ease;
  z-index: 10;
}

.control-panel.visible {
  opacity: 1;
  transform: translateY(0);
}

.control-panel .el-button {
  background: rgba(0, 0, 0, 0.5) !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  color: white !important;
  backdrop-filter: blur(10px);
}

.control-panel .el-button:hover {
  background: rgba(0, 0, 0, 0.7) !important;
  transform: scale(1.1);
}

.control-panel .el-button.is-primary {
  background: rgba(102, 126, 234, 0.8) !important;
}

/* 自定義分頁指示器 */
:deep(.swiper-pagination) {
  bottom: 60px !important;
}

:deep(.custom-bullet) {
  width: 12px !important;
  height: 12px !important;
  background: rgba(255, 255, 255, 0.5) !important;
  border-radius: 50% !important;
  opacity: 1 !important;
  transition: all 0.3s ease !important;
  font-size: 0;
}

:deep(.custom-bullet.swiper-pagination-bullet-active) {
  background: #667eea !important;
  transform: scale(1.5);
  box-shadow: 0 0 10px rgba(102, 126, 234, 0.5);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: white;
  text-align: center;
  gap: 20px;
}

.empty-state h3 {
  font-size: 2rem;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.empty-state p {
  font-size: 1.2rem;
  margin: 0;
  opacity: 0.8;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .progress-bar {
    width: 250px;
  }
  
  .custom-nav-button {
    width: 40px !important;
    height: 40px !important;
  }
  
  .control-panel {
    bottom: 10px;
    right: 10px;
  }
  
  .back-button-container {
    top: 10px;
    left: 10px;
  }
}
</style>