<template>
  <div class="polaroid-wall" data-page="wall" :style="backgroundStyle">
    <div class="back-button-container">
      <div class="back-button" @click="goBack">
        <el-icon size="20">
          <ArrowLeft />
        </el-icon>
        <span>返回</span>
      </div>
    </div>
    
    <div class="polaroid-container" v-if="messages.length > 0">
      <swiper
        :modules="modules"
        :slides-per-view="swiperConfig.slidesPerView"
        :space-between="30"
        :centered-slides="swiperConfig.centeredSlides"
        :autoplay="swiperConfig.autoplay"
        :pagination="{ 
          clickable: true,
          type: 'bullets'
        }"
        :navigation="swiperConfig.navigation"
        :effect="'coverflow'"
        :coverflow-effect="{
          rotate: 15,
          stretch: 0,
          depth: 200,
          modifier: 1,
          slideShadows: true
        }"
        :keyboard="{ enabled: true }"
        :loop="swiperConfig.loop"
        :grab-cursor="true"
        @swiper="onSwiper"
        @slide-change="onSlideChange"
        class="polaroid-swiper"
      >
        <swiper-slide v-for="(message, index) in messages" :key="`${message.id || message.timestamp || index}`">
          <PolaroidPost :message="message" />
        </swiper-slide>
      </swiper>
      
      <div class="polaroid-indicator" v-if="messages.length > 1">
        <span class="counter">{{ currentIndex + 1 }} / {{ messages.length }}</span>
      </div>
    </div>
    
    <div v-else class="empty-state">
      <el-icon size="64" color="rgba(255,255,255,0.8)">
        <PictureRounded />
      </el-icon>
      <h3>還沒有祝福訊息</h3>
      <p>快去上傳第一則祝福吧！</p>
      <el-button type="primary" @click="goBack">返回管理</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Navigation, Pagination, Autoplay, EffectCoverflow, Keyboard } from 'swiper/modules'
import PolaroidPost from '~/components/PolaroidPost.vue'
import { ArrowLeft, PictureRounded } from '@element-plus/icons-vue'

import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/autoplay'
import 'swiper/css/effect-coverflow'

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
const modules = [Navigation, Pagination, Autoplay, EffectCoverflow, Keyboard]
const swiperInstance = ref(null)
const currentIndex = ref(0)

const autoplayConfig = computed(() => ({
  delay: 4000,
  disableOnInteraction: false,
  pauseOnMouseEnter: true,
}))

// 动态 Swiper 配置，根据消息数量调整
const swiperConfig = computed(() => {
  const messageCount = props.messages.length
  
  // 如果消息数量少于3个，调整配置避免循环模式警告
  if (messageCount <= 1) {
    return {
      slidesPerView: 1,
      loop: false,
      navigation: false,
      autoplay: false,
      centeredSlides: true
    }
  } else if (messageCount === 2) {
    return {
      slidesPerView: 2,
      loop: false,
      navigation: true,
      autoplay: autoplayConfig.value,
      centeredSlides: true
    }
  } else {
    return {
      slidesPerView: 3,
      loop: true,
      navigation: true,
      autoplay: autoplayConfig.value,
      centeredSlides: true
    }
  }
})

const backgroundStyle = computed(() => {
  if (props.wallSettings.backgroundColor) {
    return { background: props.wallSettings.backgroundColor }
  }
  return { background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }
})

const goBack = () => {
  router.push(`/${props.userId}/walls/${props.wallId}`)
}

const onSwiper = (swiper: any) => {
  swiperInstance.value = swiper
}

const onSlideChange = (swiper: any) => {
  currentIndex.value = swiper.realIndex
}

useHead({
  title: 'Polaroid 祝福牆 - 婚禮祝福牆',
  meta: [
    { name: 'description', content: 'Polaroid 風格祝福牆，復古拍立得照片效果' }
  ]
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

.polaroid-indicator {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 10;
  opacity: 0.9;
  transition: all 0.3s ease;
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

:deep(.swiper-pagination-bullet) {
  background: rgba(255, 255, 255, 0.7) !important;
  opacity: 1 !important;
}

:deep(.swiper-pagination-bullet-active) {
  background: white !important;
  transform: scale(1.5);
}
</style>