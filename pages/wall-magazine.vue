<template>
  <div class="magazine-wall" data-page="wall" :style="backgroundStyle">
    <div class="back-button-container">
      <div class="back-button" @click="navigateTo('/')">
        <el-icon size="20">
          <ArrowLeft />
        </el-icon>
        <span>返回首頁</span>
      </div>
    </div>
    
    <div class="magazine-container" v-if="messages.length > 0">
      <swiper
        :modules="modules"
        :slides-per-view="1"
        :space-between="0"
        :autoplay="autoplayConfig"
        :pagination="{ 
          clickable: true,
          type: 'bullets'
        }"
        :navigation="true"
        :effect="'slide'"
        :keyboard="{ enabled: true }"
        :loop="true"
        :grab-cursor="true"
        @swiper="onSwiper"
        @slide-change="onSlideChange"
        @autoplay-pause="onAutoplayPause"
        @autoplay-resume="onAutoplayResume"
        class="magazine-swiper"
      >
        <swiper-slide v-for="(message, index) in messages" :key="`${message.timestamp}-${index}`">
          <MagazinePost :message="message" />
        </swiper-slide>
      </swiper>
      
      <div class="magazine-indicator" v-if="messages.length > 1">
        <span class="counter">{{ currentIndex + 1 }} / {{ messages.length }}</span>
      </div>
      
      <div 
        class="magazine-controls" 
        :class="{ 'visible': showControls }"
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
      </div>
    </div>
    
    <div v-else class="empty-state">
      <el-icon size="64" color="#2c3e50">
        <Document />
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
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Navigation, Pagination, Autoplay, Keyboard } from 'swiper/modules'
import MagazinePost from '~/components/MagazinePost.vue'
import QRCodeUpload from '~/components/QRCodeUpload.vue'
import { 
  ArrowLeft, 
  Document, 
  VideoPause, 
  VideoPlay,
  Promotion
} from '@element-plus/icons-vue'

import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/autoplay'

const modules = [Navigation, Pagination, Autoplay, Keyboard]

const messagesStore = useMessagesStore()
const backgroundStore = useBackgroundStore()
const uiStore = useUIStore()

const messages = computed(() => messagesStore.messages)
const swiperInstance = ref(null)
const currentIndex = ref(0)
const isPaused = ref(false)
const showControls = ref(false)
const showIndicator = ref(true)

const getDynamicDelay = (message: any) => {
  if (!message) return 6000
  
  let baseTime = 6000
  
  if (message.text && message.text.length > 100) {
    baseTime += 4000
  } else if (message.text && message.text.length > 50) {
    baseTime += 2000
  }
  
  if (message.photo) {
    baseTime += 2000
  }
  
  return Math.min(baseTime, 12000)
}

const autoplayConfig = computed(() => ({
  delay: getDynamicDelay(messages.value[currentIndex.value]),
  disableOnInteraction: false,
  pauseOnMouseEnter: true,
}))

const backgroundStyle = computed(() => {
  return {
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
  }
})

const onSwiper = (swiper: any) => {
  swiperInstance.value = swiper
}

const onSlideChange = (swiper: any) => {
  currentIndex.value = swiper.realIndex
}

const onAutoplayPause = () => {
  isPaused.value = true
}

const onAutoplayResume = () => {
  isPaused.value = false
}

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
      showControls.value = !showControls.value
      break
  }
}

useHead({
  title: 'Magazine 祝福牆 - 祝福牆',
  meta: [
    { name: 'description', content: 'Magazine 風格祝福牆，優雅的雜誌排版設計' }
  ]
})

onMounted(async () => {
  uiStore.setCurrentPage('wall')
  
  await Promise.all([
    messagesStore.fetchMessages(),
    backgroundStore.loadBackground(true)
  ])
  
  const dataInterval = setInterval(() => {
    messagesStore.fetchMessages(false)
  }, 5000)
  
  document.addEventListener('keydown', handleKeydown)
  
  onUnmounted(() => {
    clearInterval(dataInterval)
    document.removeEventListener('keydown', handleKeydown)
  })
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
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
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
  background: rgba(255, 255, 255, 0.9);
  color: #2c3e50;
  border-radius: 25px;
  cursor: pointer;
  border: 1px solid rgba(44, 62, 80, 0.2);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.back-button:hover {
  background: rgba(255, 255, 255, 1);
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.magazine-container {
  width: 100%;
  height: 100%;
}

.magazine-swiper {
  width: 100%;
  height: 100%;
}

.magazine-indicator {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 10;
  opacity: 0.9;
  transition: all 0.3s ease;
}

.magazine-indicator:hover {
  opacity: 1;
  transform: scale(1.05);
}

.counter {
  display: inline-block;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.9);
  color: #2c3e50;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  border: 1px solid rgba(44, 62, 80, 0.2);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.magazine-controls {
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

.magazine-controls.visible {
  opacity: 1;
  transform: translateY(0);
}

.magazine-controls .el-button {
  background: rgba(255, 255, 255, 0.9) !important;
  border: 1px solid rgba(44, 62, 80, 0.2) !important;
  color: #2c3e50 !important;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.magazine-controls .el-button:hover {
  background: rgba(255, 255, 255, 1) !important;
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.magazine-controls .el-button.is-primary {
  background: rgba(52, 152, 219, 0.9) !important;
  color: white !important;
}

:deep(.swiper-pagination) {
  bottom: 60px !important;
}

:deep(.swiper-pagination-bullet) {
  width: 12px !important;
  height: 12px !important;
  background: rgba(44, 62, 80, 0.5) !important;
  opacity: 1 !important;
  transition: all 0.3s ease !important;
}

:deep(.swiper-pagination-bullet-active) {
  background: #2c3e50 !important;
  transform: scale(1.5);
  box-shadow: 0 0 10px rgba(44, 62, 80, 0.5);
}

:deep(.swiper-button-next),
:deep(.swiper-button-prev) {
  color: #2c3e50 !important;
  background: rgba(255, 255, 255, 0.9) !important;
  width: 50px !important;
  height: 50px !important;
  border-radius: 50% !important;
  margin-top: -25px !important;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1) !important;
  transition: all 0.3s ease !important;
}

:deep(.swiper-button-next:hover),
:deep(.swiper-button-prev:hover) {
  background: rgba(255, 255, 255, 1) !important;
  transform: scale(1.1) !important;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15) !important;
}

:deep(.swiper-button-next::after),
:deep(.swiper-button-prev::after) {
  font-size: 18px !important;
  font-weight: bold !important;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #2c3e50;
  text-align: center;
  gap: 20px;
}

.empty-state h3 {
  font-size: 2rem;
  margin: 0;
  font-family: 'Georgia', serif;
}

.empty-state p {
  font-size: 1.2rem;
  margin: 0;
  opacity: 0.8;
}

@media (max-width: 768px) {
  .back-button-container {
    top: 10px;
    left: 10px;
  }
  
  .magazine-controls {
    bottom: 10px;
    right: 10px;
  }
  
  .magazine-indicator {
    top: 10px;
    right: 10px;
  }
}
</style>