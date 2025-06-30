<template>
  <div class="message-card">
    <!-- 圖片區域 -->
    <div v-if="message.photo" class="photo-section">
      <div class="photo-container">
        <img :src="message.photo" :alt="`${message.name}的照片`" />
      </div>
    </div>
    
    <!-- 文字區域 -->
    <div class="content-section" :class="{ 'no-photo': !message.photo }">
      <div class="message-header">
        <el-icon size="24" color="#f0bc68">
          <Star />
        </el-icon>
        <h3 class="sender-name">{{ message.name }}</h3>
        <el-icon size="24" color="#f0bc68">
          <Star />
        </el-icon>
      </div>
      
      <div class="message-text">
        <p>{{ message.text }}</p>
      </div>
      
      <div class="decoration-line"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Star } from '@element-plus/icons-vue'

defineProps<{ 
  message: { 
    name: string
    text: string
    photo?: string 
  } 
}>()
</script>

<style scoped>
.message-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  max-width: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  animation: slideIn 0.5s ease-out;
}

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

/* 圖片區域 - 更大的高度 */
.photo-section {
  width: 100%;
  height: 500px;
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
}

/* 文字區域 */
.content-section {
  padding: 2.5rem 3rem;
  text-align: center;
  background: white;
}

.content-section.no-photo {
  padding: 4rem 3rem;
}

.message-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.sender-name {
  margin: 0;
  font-size: 1.8rem;
  font-weight: bold;
  color: #2c3e50;
  letter-spacing: 1px;
}

.message-text {
  margin-bottom: 2rem;
}

.message-text p {
  margin: 0;
  font-size: 1.3rem;
  line-height: 1.8;
  color: #34495e;
  word-wrap: break-word;
  white-space: pre-wrap;
}

/* 裝飾線 */
.decoration-line {
  width: 60px;
  height: 3px;
  background: linear-gradient(to right, #f0bc68, #e67e22);
  margin: 0 auto;
  border-radius: 2px;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .photo-section {
    height: 300px;
  }
  
  .content-section {
    padding: 2rem 1.5rem;
  }
  
  .content-section.no-photo {
    padding: 3rem 1.5rem;
  }
  
  .sender-name {
    font-size: 1.5rem;
  }
  
  .message-text p {
    font-size: 1.1rem;
  }
}

@media (max-width: 480px) {
  .photo-section {
    height: 250px;
  }
  
  .content-section {
    padding: 1.5rem 1rem;
  }
  
  .content-section.no-photo {
    padding: 2.5rem 1rem;
  }
  
  .sender-name {
    font-size: 1.3rem;
  }
  
  .message-text p {
    font-size: 1rem;
  }
  
  .message-header {
    gap: 0.5rem;
  }
}

/* 大螢幕優化 */
@media (min-width: 1200px) {
  .message-card {
    max-width: 900px;
  }
  
  .photo-section {
    height: 500px;
  }
}
</style>