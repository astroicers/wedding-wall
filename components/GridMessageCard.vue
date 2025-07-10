<template>
  <div class="grid-message-card" :class="[`size-${size}`, { 'is-active': isActive }]">
    <!-- 圖片區域 -->
    <div v-if="message.photo" class="photo-section">
      <div class="photo-container">
        <img :src="message.photo" :alt="`${message.name}的照片`" />
      </div>
    </div>
    
    <!-- 文字區域 -->
    <div class="content-section" :class="{ 'no-photo': !message.photo, 'compact': size === 'thumbnail' }">
      <div class="message-header">
        <el-icon v-if="size === 'main'" size="20" color="#f0bc68">
          <Star />
        </el-icon>
        <h3 class="sender-name">{{ message.name }}</h3>
        <el-icon v-if="size === 'main'" size="20" color="#f0bc68">
          <Star />
        </el-icon>
      </div>
      
      <div class="message-text" v-if="showText">
        <p>{{ truncateText(message.text) }}</p>
      </div>
      
      <div v-if="size === 'main'" class="decoration-line"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Star } from '@element-plus/icons-vue'

interface Props {
  message: { 
    name: string
    text: string
    photo?: string 
  }
  size: 'small' | 'medium' | 'main'
  isActive: boolean
}

const props = defineProps<Props>()

// 是否顯示文字
const showText = computed(() => {
  return props.size === 'main'
})

// 根據卡片大小截斷文字
const truncateText = (text: string) => {
  if (props.size === 'small') {
    return text.length > 20 ? text.substring(0, 20) + '...' : text
  }
  if (props.size === 'medium') {
    return text.length > 30 ? text.substring(0, 30) + '...' : text
  }
  return text.length > 150 ? text.substring(0, 150) + '...' : text
}
</script>

<style scoped>
.grid-message-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 400px;
  position: relative;
  width: 100%;
}

.grid-message-card.is-active {
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
  transform: scale(1);
}

.grid-message-card:not(.is-active) {
  background: rgba(255, 255, 255, 0.85);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
}

/* 小圖尺寸 */
.size-small {
  max-width: 390px;
  width: 390px;
  min-height: 450px;
}

.size-small .photo-section {
  height: 312px;
  flex-shrink: 0;
}

.size-small .content-section {
  padding: 0.8rem 1rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.size-small .sender-name {
  font-size: 0.9rem;
  margin: 0;
  color: rgba(44, 62, 80, 0.8);
}

/* 中圖尺寸 */
.size-medium {
  max-width: 520px;
  width: 520px;
  min-height: 520px;
}

.size-medium .photo-section {
  height: 416px;
  flex-shrink: 0;
}

.size-medium .content-section {
  padding: 1rem 1.2rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.size-medium .sender-name {
  font-size: 1.1rem;
  margin: 0;
  color: rgba(44, 62, 80, 0.9);
}

/* 主圖尺寸 */
.size-main {
  max-width: 650px;
  width: 650px;
  min-height: 600px;
}

.size-main .photo-section {
  height: 400px;
  flex-shrink: 0;
}

.size-main .content-section {
  padding: 2rem 2.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.size-main .sender-name {
  font-size: 1.4rem;
  margin: 0;
  color: #2c3e50;
}

.size-main .message-text {
  font-size: 1.1rem;
  margin-top: 1rem;
}

.size-main .message-text p {
  margin: 0;
  line-height: 1.6;
}

/* 圖片區域 */
.photo-section {
  width: 100%;
  overflow: hidden;
  position: relative;
  background: #f5f5f5;
}

.photo-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%);
}

.photo-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  background: white;
  transition: all 0.3s ease;
}


/* 文字區域 */
.content-section {
  text-align: center;
  background: white;
  flex: 1;
  min-height: 80px;
  position: relative;
}

.content-section.no-photo {
  padding-top: 2rem;
}

.message-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.sender-name {
  color: #2c3e50;
  font-weight: 600;
  text-align: center;
}

.message-text {
  color: #555;
  text-align: center;
}

.decoration-line {
  width: 60px;
  height: 3px;
  background: linear-gradient(90deg, #f0bc68, #e67e22);
  margin: 1.5rem auto 0;
  border-radius: 2px;
}

/* 動畫效果 */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.grid-message-card {
  animation: slideIn 0.4s ease-out;
  outline: none;
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

.grid-message-card:focus {
  outline: none;
}

.grid-message-card * {
  outline: none;
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

.grid-message-card *:focus {
  outline: none;
}

/* 響應式調整 */
@media (max-width: 1200px) {
  .size-main {
    max-width: 400px;
    width: 400px;
  }
  
  .size-main .photo-section {
    height: 320px;
  }
  
  .size-medium {
    max-width: 320px;
    width: 320px;
  }
  
  .size-medium .photo-section {
    height: 256px;
  }
  
  .size-small {
    max-width: 240px;
    width: 240px;
  }
  
  .size-small .photo-section {
    height: 192px;
  }
}

@media (max-width: 768px) {
  .size-main {
    max-width: 350px;
    width: 100%;
  }
  
  .size-main .photo-section {
    height: 250px;
  }
  
  .size-main .content-section {
    padding: 1.5rem 2rem;
  }
  
  .size-medium .photo-section {
    height: 200px;
  }
  
  .size-medium .content-section {
    padding: 0.6rem 0.8rem;
  }
  
  .size-small .photo-section {
    height: 150px;
  }
  
  .size-small .content-section {
    padding: 0.4rem 0.6rem;
  }
}
</style>