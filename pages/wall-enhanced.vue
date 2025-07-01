<template>
  <div class="wall-page" data-page="wall-enhanced" :style="backgroundStyle">
    <!-- 返回按鈕容器 - 隱藏區域 -->
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
    
    <!-- 祝福牆內容 -->
    <div class="wall" v-if="messages.length > 0">
      <!-- Swiper 輪播 -->
      <swiper
        :modules="modules"
        :slides-per-view="3"
        :space-between="30"
        :centered-slides="true"
        :autoplay="autoplayConfig"
        :pagination="{ 
          clickable: true,
          renderBullet: renderPaginationBullet
        }"
        :navigation="{
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev'
        }"
        :effect="'coverflow'"
        :coverflow-effect="{
          rotate: 15,
          stretch: 0,
          depth: 200,
          modifier: 1,
          slideShadows: false
        }"
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
import { Navigation, Pagination, Autoplay, EffectFade, EffectCube, EffectFlip, EffectCoverflow, Keyboard } from 'swiper/modules'
import InstagramPost from '~/components/InstagramPost.vue'
import { useGoogleFonts } from '~/composables/useGoogleFonts'
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
import 'swiper/css/effect-coverflow'

const modules = [Navigation, Pagination, Autoplay, EffectFade, EffectCube, EffectFlip, EffectCoverflow, Keyboard]

// Pinia Stores
const messagesStore = useMessagesStore()
const backgroundStore = useBackgroundStore()
const uiStore = useUIStore()

// 使用 Google Fonts 工具
const { isGoogleFont, getFontFamilyWithFallback, loadFont } = useGoogleFonts()

// 響應式資料
const messages = computed(() => messagesStore.messages)
const swiperInstance = ref(null)
const currentIndex = ref(0)
const isPaused = ref(false)
const showControls = ref(false)
const isControlsForced = ref(false)
const showIndicator = ref(true)
const currentEffect = ref('coverflow')

// 標題設定
const titleSettings = ref({
  wallTitle: '婚禮祝福牆',
  wallSubtitle: '',
  titleColor: '#ffffff',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  fontSize: 48
})

// 牆面設定項目
const wallSettings = ref({
  autoplayDelay: 3,
  imageDelay: 1
})

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

// 載入牆面設定
const loadWallSettings = () => {
  try {
    const settings = localStorage.getItem('wallSettings')
    if (settings) {
      wallSettings.value = { ...wallSettings.value, ...JSON.parse(settings) }
    }
  } catch (error) {
    console.error('載入牆面設定失敗:', error)
  }
}

// 動態切換時間配置
const getDynamicDelay = (message: any) => {
  if (!message) return wallSettings.value.autoplayDelay * 1000
  
  let baseTime = wallSettings.value.autoplayDelay * 1000 // 基礎時間
  
  // 有照片時增加時間
  if (message.photo) {
    baseTime += wallSettings.value.imageDelay * 1000 // 照片額外時間
  }
  
  return baseTime
}

// 自動播放配置
const autoplayConfig = computed(() => ({
  delay: getDynamicDelay(messages.value[currentIndex.value]),
  disableOnInteraction: false,
  pauseOnMouseEnter: true,
}))

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
  const effects = ['coverflow', 'fade', 'cube', 'flip']
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

// 監聽標題設定變更
const handleTitleUpdated = (event: CustomEvent) => {
  titleSettings.value = { ...titleSettings.value, ...event.detail }
  
  // 載入字體（如果需要）
  if (event.detail.fontFamily) {
    loadFont(event.detail.fontFamily)
  }
}

// 監聽牆面設定變更
const handleWallSettingsUpdated = (event: CustomEvent) => {
  wallSettings.value = { ...wallSettings.value, ...event.detail }
}

onMounted(async () => {
  // 設定當前頁面
  uiStore.setCurrentPage('wall-enhanced')
  
  // 載入所有設定
  loadTitleSettings()
  loadWallSettings()
  
  // 載入資料
  await Promise.all([
    messagesStore.fetchMessages(),
    backgroundStore.loadBackground(true)
  ])
  
  // 定期更新資料
  const dataInterval = setInterval(() => {
    messagesStore.fetchMessages(false)
  }, 5000)
  
  const backgroundInterval = setInterval(() => {
    backgroundStore.loadBackground()
  }, 300000)
  
  // 監聽鍵盤事件
  document.addEventListener('keydown', handleKeydown)
  
  // 監聽背景更新
  const handleBackgroundUpdate = (event: MessageEvent) => {
    if (event.data && event.data.type === 'BACKGROUND_UPDATED') {
      backgroundStore.loadBackground(true)
    }
  }
  window.addEventListener('message', handleBackgroundUpdate)
  
  // 監聽設定更新
  window.addEventListener('wallTitleUpdated', handleTitleUpdated as EventListener)
  window.addEventListener('wallSettingsUpdated', handleWallSettingsUpdated as EventListener)
  
  // 清理
  onUnmounted(() => {
    clearInterval(dataInterval)
    clearInterval(backgroundInterval)
    document.removeEventListener('keydown', handleKeydown)
    window.removeEventListener('message', handleBackgroundUpdate)
    window.removeEventListener('wallTitleUpdated', handleTitleUpdated as EventListener)
    window.removeEventListener('wallSettingsUpdated', handleWallSettingsUpdated as EventListener)
  })
})
</script>

<style scoped>
.wall-page {
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
  flex-shrink: 0;
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

.wall {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
}

.message-swiper {
  flex: 1;
  width: 100%;
  height: 100%;
  padding: 20px 0;
  overflow: hidden;
}

.message-swiper .swiper-slide {
  transition: all 0.3s ease;
  padding: 0 20px;
}

.message-swiper .swiper-slide-active {
  transform: scale(1.0) !important;
  z-index: 10 !important;
}

.message-swiper .swiper-slide:not(.swiper-slide-active) {
  opacity: 1;
  transform: scale(0.9);
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

/* 移除滾動條 */
.wall-page {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.wall-page::-webkit-scrollbar {
  display: none;
}

.message-swiper {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.message-swiper::-webkit-scrollbar {
  display: none;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .wall-header {
    padding: 1.5rem 0 0.75rem;
  }
  
  .wall-title {
    font-size: 2rem;
  }
  
  .wall-subtitle {
    font-size: 1rem;
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
    width: 100px;
    height: 70px;
  }
  
  .back-button {
    top: 15px;
    left: 15px;
    padding: 0.5rem 0.75rem;
  }
  
  .back-button span {
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .back-button-container {
    width: 80px;
    height: 60px;
  }
  
  .back-button {
    top: 10px;
    left: 10px;
    padding: 0.5rem;
  }
  
  .back-button span {
    display: none;
  }
  
  .wall-title {
    font-size: 1.5rem;
  }
  
  .wall-subtitle {
    font-size: 0.9rem;
  }
  
  .control-panel {
    bottom: 5px;
    right: 5px;
    gap: 5px;
  }
  
  .page-indicator {
    top: 10px;
    right: 10px;
  }
  
  .counter {
    padding: 6px 12px;
    font-size: 12px;
  }
}
</style>