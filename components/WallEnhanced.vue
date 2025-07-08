<template>
  <div class="wall-page" data-page="wall-enhanced" :style="backgroundStyle">
    <!-- 返回按鈕容器 - 隱藏區域 -->
    <div class="back-button-container">
      <div class="back-button" @click="goBack">
        <el-icon size="20">
          <ArrowLeft />
        </el-icon>
        <span>返回首頁</span>
      </div>
    </div>
    
    <!-- 祝福牆標題 -->
    <div class="wall-header" v-if="messages.length > 0">
      <h1 class="wall-title" :style="titleStyle">{{ wallSettings.wallTitle || '增強祝福牆' }}</h1>
      <p class="wall-subtitle" v-if="wallSettings.wallSubtitle" :style="subtitleStyle">{{ wallSettings.wallSubtitle }}</p>
    </div>
    
    <!-- 祝福牆內容 -->
    <div class="wall" v-if="messages.length > 0">
      <!-- Swiper 輪播 -->
      <swiper
        :modules="modules"
        :slides-per-view="swiperConfig.slidesPerView"
        :space-between="30"
        :centered-slides="true"
        :autoplay="swiperConfig.autoplay"
        :pagination="{ 
          clickable: true,
          renderBullet: renderPaginationBullet
        }"
        :navigation="swiperConfig.navigation ? {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev'
        } : false"
        :effect="'coverflow'"
        :coverflow-effect="{
          rotate: 15,
          stretch: 0,
          depth: 200,
          modifier: 1,
          slideShadows: false
        }"
        :keyboard="{ enabled: true }"
        :loop="swiperConfig.loop"
        :grab-cursor="true"
        @swiper="onSwiper"
        @slide-change="onSlideChange"
        @autoplay-pause="onAutoplayPause"
        @autoplay-resume="onAutoplayResume"
        class="message-swiper"
      >
        <swiper-slide v-for="(message, index) in messages" :key="`${message.id || message.timestamp || index}`">
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
          @click="switchEffect"
          type="info"
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
      <el-button type="primary" @click="goBack">返回管理</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Navigation, Pagination, Autoplay, EffectCoverflow, EffectFade, EffectCube, EffectFlip, Keyboard } from 'swiper/modules'
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
import { useGoogleFonts } from '~/composables/useGoogleFonts'

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/autoplay'
import 'swiper/css/effect-coverflow'
import 'swiper/css/effect-fade'
import 'swiper/css/effect-cube'
import 'swiper/css/effect-flip'

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
const modules = [Navigation, Pagination, Autoplay, EffectCoverflow, EffectFade, EffectCube, EffectFlip, Keyboard]
const { getFontFamilyWithFallback, loadFont } = useGoogleFonts()

// 响应式数据
const swiperInstance = ref(null)
const currentIndex = ref(0)
const isPaused = ref(false)
const showIndicator = ref(true)
const showControls = ref(false)
const isControlsForced = ref(false)
const currentEffect = ref('coverflow')

// 自动播放配置
const autoplayConfig = computed(() => ({
  delay: 4000,
  disableOnInteraction: false,
  pauseOnMouseEnter: false
}))

// 动态 Swiper 配置
const swiperConfig = computed(() => {
  const messageCount = props.messages.length
  if (messageCount <= 1) {
    return { 
      slidesPerView: 1, 
      loop: false, 
      navigation: false, 
      autoplay: false
    }
  } else if (messageCount === 2) {
    return { 
      slidesPerView: 2, 
      loop: false, 
      navigation: true, 
      autoplay: autoplayConfig.value
    }
  } else {
    return { 
      slidesPerView: 1, 
      loop: true, 
      navigation: true, 
      autoplay: autoplayConfig.value
    }
  }
})

// 背景样式
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

// 返回功能
const goBack = () => {
  router.push(`/${props.userId}/walls/${props.wallId}`)
}

// Swiper 事件处理
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

// 控制功能
const toggleAutoplay = () => {
  if (swiperInstance.value) {
    if (isPaused.value) {
      swiperInstance.value.autoplay.start()
    } else {
      swiperInstance.value.autoplay.stop()
    }
    isPaused.value = !isPaused.value
  }
}

const toggleIndicator = () => {
  showIndicator.value = !showIndicator.value
}

// 切换效果
const effects = ['coverflow', 'fade', 'cube', 'flip']
const switchEffect = () => {
  const currentIdx = effects.indexOf(currentEffect.value)
  currentEffect.value = effects[(currentIdx + 1) % effects.length]
  
  if (swiperInstance.value) {
    // 动态切换效果
    swiperInstance.value.params.effect = currentEffect.value
    swiperInstance.value.update()
  }
}

// 自定义分页
const renderPaginationBullet = (index: number, className: string) => {
  return `<span class="${className} custom-bullet"></span>`
}

// 生命周期
onMounted(() => {
  // 載入字體
  if (props.wallSettings.fontFamily) {
    loadFont(props.wallSettings.fontFamily)
  }
  
  // 3秒后自动隐藏控制面板
  setTimeout(() => {
    isControlsForced.value = false
  }, 3000)
})

// 设置页面meta
useHead({
  title: '增強祝福牆 - Instagram風格',
  meta: [
    { name: 'description', content: '酷炫的Instagram風格祝福牆展示' }
  ]
})
</script>

<style scoped>
.wall-page {
  width: 100vw;
  height: 100vh;
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
  backdrop-filter: blur(10px);
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
  padding: 2rem 1rem 1rem;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
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

/* 主要内容 */
.wall {
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

/* Swiper 样式 */
.message-swiper {
  width: 100%;
  height: 600px;
  padding: 0 50px;
}

.swiper-slide {
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.4;
  transition: opacity 0.3s ease;
}

.swiper-slide-active {
  opacity: 1;
}

.swiper-slide-prev,
.swiper-slide-next {
  opacity: 0.7;
}

/* 自定義導航按鈕 */
.custom-nav-button {
  width: 50px;
  height: 50px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  color: #333;
}

.custom-nav-button:hover {
  background: white;
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
}

.swiper-button-prev.custom-nav-button {
  left: 20px;
}

.swiper-button-next.custom-nav-button {
  right: 20px;
}

/* 自定義分頁 */
:deep(.swiper-pagination) {
  bottom: -30px !important;
}

:deep(.custom-bullet) {
  width: 10px;
  height: 10px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 50%;
  margin: 0 5px;
  transition: all 0.3s ease;
}

:deep(.custom-bullet.swiper-pagination-bullet-active) {
  width: 30px;
  height: 10px;
  border-radius: 5px;
  background: white;
}

/* 頁面指示器 */
.page-indicator {
  position: absolute;
  bottom: 3rem;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(10px);
  border-radius: 30px;
  padding: 0.75rem 1.5rem;
  color: white;
  font-size: 0.9rem;
  font-weight: 500;
  letter-spacing: 1px;
  z-index: 10;
  pointer-events: none;
  transition: all 0.3s ease;
}

/* 控制面板 */
.control-panel {
  position: absolute;
  bottom: 100px;
  right: 30px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  opacity: 0;
  transform: translateX(20px);
  transition: all 0.3s ease;
  z-index: 100;
}

.control-panel.visible {
  opacity: 1;
  transform: translateX(0);
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
  backdrop-filter: blur(5px);
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

/* 響應式設計 */
@media (max-width: 768px) {
  .message-swiper {
    height: 500px;
    padding: 0 20px;
  }
  
  .custom-nav-button {
    width: 40px;
    height: 40px;
  }
  
  .swiper-button-prev.custom-nav-button {
    left: 10px;
  }
  
  .swiper-button-next.custom-nav-button {
    right: 10px;
  }
  
  .control-panel {
    bottom: 80px;
    right: 20px;
  }
}

@media (max-width: 480px) {
  .wall-header {
    padding: 1.5rem 1rem 0.5rem;
  }
  
  .wall-title {
    font-size: 1.8rem;
  }
  
  .message-swiper {
    height: 400px;
  }
  
  .page-indicator {
    bottom: 2rem;
    font-size: 0.8rem;
    padding: 0.5rem 1rem;
  }
}

/* 移除滾動條 */
.wall-page {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.wall-page::-webkit-scrollbar {
  display: none;
}
</style>