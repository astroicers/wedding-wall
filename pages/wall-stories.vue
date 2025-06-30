<template>
  <div class="stories-wall" data-page="wall" :style="backgroundStyle">
    <div class="back-button-container">
      <div class="back-button" @click="navigateTo('/')">
        <el-icon size="20">
          <ArrowLeft />
        </el-icon>
        <span>返回首頁</span>
      </div>
    </div>
    
    <div class="stories-container" v-if="messages.length > 0">
      <swiper
        :modules="modules"
        :slides-per-view="1"
        :space-between="0"
        :autoplay="autoplayConfig"
        :direction="'vertical'"
        :mouse-wheel="{ releaseOnEdges: true }"
        :keyboard="{ enabled: true }"
        :loop="true"
        :grab-cursor="true"
        @swiper="onSwiper"
        @slide-change="onSlideChange"
        @autoplay-pause="onAutoplayPause"
        @autoplay-resume="onAutoplayResume"
        class="stories-swiper"
      >
        <swiper-slide v-for="(message, index) in messages" :key="`${message.timestamp}-${index}`">
          <StoriesPost :message="message" :progress="getProgress(index)" />
        </swiper-slide>
      </swiper>
      
      <div class="stories-indicator" v-if="messages.length > 1">
        <div 
          v-for="(message, index) in messages" 
          :key="index"
          class="indicator-dot"
          :class="{ active: index === currentIndex }"
        ></div>
      </div>
      
      <div 
        class="stories-controls" 
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
      </div>
    </div>
    
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
import { Autoplay, Mousewheel, Keyboard } from 'swiper/modules'
import StoriesPost from '~/components/StoriesPost.vue'
import { 
  ArrowLeft, 
  Picture, 
  VideoPause, 
  VideoPlay
} from '@element-plus/icons-vue'

import 'swiper/css'
import 'swiper/css/autoplay'

const modules = [Autoplay, Mousewheel, Keyboard]

const messagesStore = useMessagesStore()
const backgroundStore = useBackgroundStore()
const uiStore = useUIStore()

const messages = computed(() => messagesStore.messages)
const swiperInstance = ref(null)
const currentIndex = ref(0)
const isPaused = ref(false)
const showControls = ref(false)
const storyProgress = ref(0)

const getDynamicDelay = (message: any) => {
  if (!message) return 5000
  
  let baseTime = 5000
  
  if (message.text && message.text.length > 50) {
    baseTime += 3000
  }
  
  if (message.photo) {
    baseTime += 2000
  }
  
  return Math.min(baseTime, 10000)
}

const autoplayConfig = computed(() => ({
  delay: getDynamicDelay(messages.value[currentIndex.value]),
  disableOnInteraction: false,
}))

const backgroundStyle = computed(() => {
  return {
    background: '#000'
  }
})

const getProgress = (index: number) => {
  if (index === currentIndex.value) {
    return storyProgress.value
  }
  return index < currentIndex.value ? 100 : 0
}

const onSwiper = (swiper: any) => {
  swiperInstance.value = swiper
}

const onSlideChange = (swiper: any) => {
  currentIndex.value = swiper.realIndex
  storyProgress.value = 0
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

const handleKeydown = (event: KeyboardEvent) => {
  switch (event.key) {
    case ' ':
      event.preventDefault()
      toggleAutoplay()
      break
    case 'c':
    case 'C':
      showControls.value = !showControls.value
      break
  }
}

useHead({
  title: 'Stories 祝福牆 - 婚禮祝福牆',
  meta: [
    { name: 'description', content: 'Stories 風格祝福牆，垂直全螢幕體驗' }
  ]
})

onMounted(async () => {
  uiStore.setCurrentPage('wall')
  
  await Promise.all([
    messagesStore.fetchMessages(),
    backgroundStore.loadBackground(true)
  ])
  
  const progressInterval = setInterval(() => {
    if (!isPaused.value && swiperInstance.value) {
      const delay = getDynamicDelay(messages.value[currentIndex.value])
      storyProgress.value += (100 / delay) * 100
      
      if (storyProgress.value >= 100) {
        storyProgress.value = 0
      }
    }
  }, 100)
  
  const dataInterval = setInterval(() => {
    messagesStore.fetchMessages(false)
  }, 10000)
  
  document.addEventListener('keydown', handleKeydown)
  
  onUnmounted(() => {
    clearInterval(progressInterval)
    clearInterval(dataInterval)
    document.removeEventListener('keydown', handleKeydown)
  })
})
</script>

<style scoped>
.stories-wall {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #000;
  margin: 0;
  padding: 0;
  z-index: 1;
  display: flex;
  justify-content: center;
  align-items: center;
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

.stories-wall:hover .back-button-container {
  opacity: 1;
  transform: translateX(0);
}

.back-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border-radius: 25px;
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.back-button:hover {
  background: rgba(0, 0, 0, 0.9);
  transform: scale(1.05);
}

.stories-container {
  width: min(calc(100vh * 9 / 16), 100vw);
  height: min(calc(100vw * 16 / 9), 100vh);
  display: flex;
  justify-content: center;
  align-items: center;
  background: #000;
  position: relative;
}

.stories-swiper {
  width: 100%;
  height: 100%;
  position: relative;
}

/* 強制 swiper 和 slides 維持正確尺寸 */
.stories-swiper,
.stories-swiper :deep(.swiper),
.stories-swiper :deep(.swiper-wrapper),
.stories-swiper :deep(.swiper-slide) {
  width: 100% !important;
  height: 100% !important;
}

/* 桌面端：固定 9:16 比例 */
@media (min-width: 769px) {
  .stories-container {
    /* 以視窗高度為基準計算寬度 */
    width: calc(100vh * 9 / 16);
    height: 100vh;
    /* 如果算出的寬度超過 600px，則限制最大尺寸 */
    max-width: 600px;
    max-height: calc(600px * 16 / 9);
  }
  
  /* 如果視窗太窄，以寬度為基準 */
  @media (max-aspect-ratio: 9/16) {
    .stories-container {
      width: min(100vw, 600px);
      height: calc(min(100vw, 600px) * 16 / 9);
    }
  }
}

/* 手機端：適應螢幕 */
@media (max-width: 768px) {
  .stories-container {
    width: 100vw;
    height: calc(100vw * 16 / 9);
    max-height: 100vh;
  }
  
  /* 如果螢幕太矮 */
  @media (max-aspect-ratio: 9/16) {
    .stories-container {
      width: calc(100vh * 9 / 16);
      height: 100vh;
    }
  }
}

.stories-indicator {
  position: absolute;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  z-index: 10;
}

.indicator-dot {
  width: 30px;
  height: 3px;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 2px;
  transition: all 0.3s ease;
}

.indicator-dot.active {
  background: white;
}

.stories-controls {
  position: absolute;
  bottom: 20px;
  right: 20px;
  opacity: 0;
  transform: translateY(10px);
  transition: all 0.3s ease;
  z-index: 10;
}

.stories-controls.visible {
  opacity: 1;
  transform: translateY(0);
}

.stories-controls .el-button {
  background: rgba(0, 0, 0, 0.7) !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  color: white !important;
}

.stories-controls .el-button:hover {
  background: rgba(0, 0, 0, 0.9) !important;
  transform: scale(1.1);
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

/* Swiper slides 也要維持 9:16 比例 */
.stories-swiper :deep(.swiper-slide) {
  width: 100% !important;
  height: 100% !important;
  display: flex;
  justify-content: center;
  align-items: center;
}

@media (max-width: 768px) {
  .back-button-container {
    top: 10px;
    left: 10px;
  }
  
  .stories-controls {
    bottom: 10px;
    right: 10px;
  }
  
  .stories-indicator {
    top: 70px;
  }
}
</style>