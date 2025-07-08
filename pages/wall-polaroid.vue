<template>
  <div class="polaroid-wall" data-page="wall" :style="backgroundStyle">
    <div class="back-button-container">
      <div class="back-button" @click="navigateTo('/')">
        <el-icon size="20">
          <ArrowLeft />
        </el-icon>
        <span>返回首頁</span>
      </div>
    </div>
    
    <div class="polaroid-container" v-if="messages.length > 0">
      <swiper
        :modules="modules"
        :slides-per-view="3"
        :space-between="30"
        :centered-slides="true"
        :autoplay="autoplayConfig"
        :pagination="{ 
          clickable: true,
          type: 'bullets'
        }"
        :navigation="true"
        :effect="'coverflow'"
        :coverflow-effect="{
          rotate: 15,
          stretch: 0,
          depth: 200,
          modifier: 1,
          slideShadows: true
        }"
        :keyboard="{ enabled: true }"
        :loop="true"
        :grab-cursor="true"
        @swiper="onSwiper"
        @slide-change="onSlideChange"
        @autoplay-pause="onAutoplayPause"
        @autoplay-resume="onAutoplayResume"
        class="polaroid-swiper"
      >
        <swiper-slide v-for="(message, index) in messages" :key="`${message.timestamp}-${index}`">
          <PolaroidPost :message="message" />
        </swiper-slide>
      </swiper>
      
      <div class="polaroid-indicator" v-if="showIndicator && messages.length > 1">
        <span class="counter">{{ currentIndex + 1 }} / {{ messages.length }}</span>
      </div>
      
      <div 
        class="polaroid-controls" 
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
        
        <el-button 
          circle 
          @click="shufflePhotos"
          size="large"
        >
          <el-icon size="20">
            <RefreshRight />
          </el-icon>
        </el-button>
      </div>
    </div>
    
    <div v-else class="empty-state">
      <el-icon size="64" color="rgba(255,255,255,0.8)">
        <PictureRounded />
      </el-icon>
      <h3>還沒有祝福訊息</h3>
      <p>快去上傳第一則祝福吧！</p>
      <el-button type="primary" @click="navigateTo('/')">前往上傳</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Navigation, Pagination, Autoplay, EffectCoverflow, Keyboard } from 'swiper/modules'
import PolaroidPost from '~/components/PolaroidPost.vue'
import { 
  ArrowLeft, 
  PictureRounded, 
  VideoPause, 
  VideoPlay,
  Promotion,
  RefreshRight
} from '@element-plus/icons-vue'

import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/autoplay'
import 'swiper/css/effect-coverflow'

const modules = [Navigation, Pagination, Autoplay, EffectCoverflow, Keyboard]

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
  if (!message) return 5000
  
  let baseTime = 5000
  
  if (message.text && message.text.length > 80) {
    baseTime += 3000
  } else if (message.text && message.text.length > 40) {
    baseTime += 1500
  }
  
  if (message.photo) {
    baseTime += 2000
  }
  
  return Math.min(baseTime, 10000)
}

const autoplayConfig = computed(() => ({
  delay: getDynamicDelay(messages.value[currentIndex.value]) || 4000,
  disableOnInteraction: false,
  pauseOnMouseEnter: true,
  waitForTransition: false,
  stopOnLastSlide: false,
  reverseDirection: false,
}))

const backgroundStyle = computed(() => {
  return {
    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
  }
})

const onSwiper = (swiper: any) => {
  swiperInstance.value = swiper
  
  // 確保自動播放開始
  nextTick(() => {
    if (swiper && messages.value.length > 1) {
      // 強制停止然後重新啟動自動播放
      swiper.autoplay.stop()
      setTimeout(() => {
        swiper.autoplay.start()
        console.log('Autoplay started for polaroid')
      }, 100)
    }
  })
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

const shufflePhotos = () => {
  if (swiperInstance.value) {
    const randomIndex = Math.floor(Math.random() * messages.value.length)
    swiperInstance.value.slideTo(randomIndex)
    ElMessage.success('隨機切換照片！')
  }
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
    case 'r':
    case 'R':
      shufflePhotos()
      break
    case 'c':
    case 'C':
      showControls.value = !showControls.value
      break
  }
}

useHead({
  title: 'Polaroid 祝福牆 - 婚禮祝福牆',
  meta: [
    { name: 'description', content: 'Polaroid 風格祝福牆，復古拍立得照片效果' }
  ]
})

onMounted(async () => {
  uiStore.setCurrentPage('wall')
  
  await Promise.all([
    messagesStore.fetchMessages(),
    backgroundStore.loadBackground(true)
  ])
  
  // 確保自動播放在數據加載後啟動
  nextTick(() => {
    if (swiperInstance.value && messages.value.length > 1) {
      swiperInstance.value.autoplay.stop()
      setTimeout(() => {
        swiperInstance.value.autoplay.start()
        console.log('Autoplay restarted after data load')
      }, 500)
    }
  })
  
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
.polaroid-wall {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
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

.polaroid-wall:hover .back-button-container {
  opacity: 1;
  transform: translateX(0);
}

.back-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.9);
  color: #e91e63;
  border-radius: 25px;
  cursor: pointer;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(233, 30, 99, 0.2);
  box-shadow: 0 4px 15px rgba(233, 30, 99, 0.2);
  transition: all 0.3s ease;
}

.back-button:hover {
  background: rgba(255, 255, 255, 1);
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(233, 30, 99, 0.3);
}

.polaroid-container {
  width: 100%;
  height: 100%;
}

.polaroid-swiper {
  width: 100%;
  height: 100%;
  padding: 50px 0;
}

.polaroid-swiper .swiper-slide {
  transition: all 0.3s ease;
}

.polaroid-swiper .swiper-slide-active {
  transform: scale(1.1) !important;
  z-index: 10 !important;
}

.polaroid-swiper .swiper-slide:not(.swiper-slide-active) {
  opacity: 0.7;
  transform: scale(0.85);
}

.polaroid-indicator {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 10;
  opacity: 0.9;
  transition: all 0.3s ease;
}

.polaroid-indicator:hover {
  opacity: 1;
  transform: scale(1.05);
}

.counter {
  display: inline-block;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.9);
  color: #e91e63;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(233, 30, 99, 0.2);
  box-shadow: 0 4px 15px rgba(233, 30, 99, 0.2);
}

.polaroid-controls {
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

.polaroid-controls.visible {
  opacity: 1;
  transform: translateY(0);
}

.polaroid-controls .el-button {
  background: rgba(255, 255, 255, 0.9) !important;
  border: 1px solid rgba(233, 30, 99, 0.2) !important;
  color: #e91e63 !important;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 15px rgba(233, 30, 99, 0.2);
}

.polaroid-controls .el-button:hover {
  background: rgba(255, 255, 255, 1) !important;
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(233, 30, 99, 0.3);
}

.polaroid-controls .el-button.is-primary {
  background: rgba(233, 30, 99, 0.9) !important;
  color: white !important;
}

:deep(.swiper-pagination) {
  bottom: 100px !important;
}

:deep(.swiper-pagination-bullet) {
  width: 12px !important;
  height: 12px !important;
  background: rgba(255, 255, 255, 0.7) !important;
  opacity: 1 !important;
  transition: all 0.3s ease !important;
}

:deep(.swiper-pagination-bullet-active) {
  background: white !important;
  transform: scale(1.5);
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
}

:deep(.swiper-button-next),
:deep(.swiper-button-prev) {
  color: white !important;
  background: rgba(255, 255, 255, 0.2) !important;
  width: 50px !important;
  height: 50px !important;
  border-radius: 50% !important;
  margin-top: -25px !important;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2) !important;
  backdrop-filter: blur(10px) !important;
  transition: all 0.3s ease !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
}

:deep(.swiper-button-next:hover),
:deep(.swiper-button-prev:hover) {
  background: rgba(255, 255, 255, 0.3) !important;
  transform: scale(1.1) !important;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3) !important;
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

@media (max-width: 768px) {
  .back-button-container {
    top: 10px;
    left: 10px;
  }
  
  .polaroid-controls {
    bottom: 10px;
    right: 10px;
  }
  
  .polaroid-indicator {
    top: 10px;
    right: 10px;
  }
}
</style>