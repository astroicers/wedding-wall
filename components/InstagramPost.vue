<template>
  <div class="instagram-post">
    <!-- 貼文容器 -->
    <div class="post-container" :class="{ 'has-image': message.photo }">
      <!-- 背景圖片 -->
      <div 
        v-if="message.photo" 
        class="post-background"
        :style="{ backgroundImage: `url(${message.photo})` }"
      ></div>
      
      <!-- 沒有圖片時的漸變背景 -->
      <div v-else class="post-gradient-bg"></div>
      
      <!-- 遮罩層 -->
      <div class="post-overlay"></div>
      
      <!-- 內容層 -->
      <div class="post-content">
        <!-- 用戶資訊 -->
        <div class="user-info">
          <div class="avatar">
            <el-icon size="24">
              <User />
            </el-icon>
          </div>
          <div class="user-details">
            <div class="username">{{ message.name }}</div>
            <div class="timestamp">剛剛</div>
          </div>
        </div>
        
        <!-- 底部區域 -->
        <div class="post-bottom">
          <!-- 左側互動按鈕 -->
          <div class="post-actions">
            <div class="action-buttons">
              <el-icon class="action-icon love" size="20">
                <Star />
              </el-icon>
              <el-icon class="action-icon" size="20">
                <ChatRound />
              </el-icon>
              <el-icon class="action-icon" size="20">
                <Share />
              </el-icon>
            </div>
            <div class="post-stats">
              <span class="likes">{{ randomLikes }} 個讚</span>
            </div>
          </div>
          
          <!-- 右下角留言內容 -->
          <div class="post-text">
            <p>{{ message.text }}</p>
          </div>
        </div>
      </div>
      
      <!-- 愛心動畫 -->
      <div class="heart-animation" ref="heartAnimation">
        <el-icon size="60">
          <Star />
        </el-icon>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { User, Star, ChatRound, Share } from '@element-plus/icons-vue'

const props = defineProps<{ 
  message: { 
    name: string
    text: string
    photo?: string 
  } 
}>()

const heartAnimation = ref(null)

// 隨機讚數
const randomLikes = computed(() => {
  const hash = props.message.name.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0)
    return a & a
  }, 0)
  return Math.abs(hash % 100) + 10
})

// 雙擊愛心動畫
const handleDoubleClick = () => {
  if (heartAnimation.value) {
    const heart = heartAnimation.value as HTMLElement
    heart.classList.remove('animate')
    setTimeout(() => {
      heart.classList.add('animate')
    }, 10)
    
    // 移除動畫類別
    setTimeout(() => {
      heart.classList.remove('animate')
    }, 1000)
  }
}

onMounted(() => {
  // 添加雙擊事件監聽
  const container = document.querySelector('.post-container')
  if (container) {
    container.addEventListener('dblclick', handleDoubleClick)
  }
})
</script>

<style scoped>
.instagram-post {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.post-container {
  position: relative;
  width: 100%;
  max-width: 500px;
  height: 600px;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  transition: transform 0.3s ease;
}

.post-container:hover {
  transform: scale(1.02);
}

.post-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  filter: blur(1px);
}

.post-gradient-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, 
    #ff6b6b, #ffd93d, #6bcf7f, #4ecdc4, #45b7d1, #96ceb4, #feca57, #ff9ff3);
  background-size: 300% 300%;
  animation: gradientShift 8s ease infinite;
}

@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.post-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.3) 0%,
    rgba(0, 0, 0, 0.1) 40%,
    rgba(0, 0, 0, 0.1) 60%,
    rgba(0, 0, 0, 0.6) 100%
  );
}

.post-content {
  position: relative;
  z-index: 2;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px;
  color: white;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: auto;
}

.avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.user-details {
  flex: 1;
}

.username {
  font-weight: 600;
  font-size: 16px;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
  margin-bottom: 2px;
}

.timestamp {
  font-size: 12px;
  opacity: 0.8;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.post-bottom {
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 20px;
}

.post-actions {
  flex-shrink: 0;
}

.post-text {
  flex: 1;
  text-align: right;
}

.post-text p {
  font-size: 16px;
  line-height: 1.5;
  font-weight: 500;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.7);
  margin: 0;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.5));
  padding: 15px 20px;
  border-radius: 15px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  max-width: 300px;
  margin-left: auto;
}

.action-buttons {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
}

.action-icon {
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.5));
}

.action-icon:hover {
  transform: scale(1.2);
  color: #ff6b6b;
}

.action-icon.love {
  color: #ff6b6b;
  animation: heartbeat 2s infinite;
}

@keyframes heartbeat {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.post-stats {
  font-size: 14px;
  font-weight: 500;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.likes {
  opacity: 0.9;
}

.heart-animation {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #ff6b6b;
  opacity: 0;
  pointer-events: none;
  z-index: 10;
}

.heart-animation.animate {
  animation: heartPop 1s ease-out;
}

@keyframes heartPop {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0);
  }
  50% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1.3);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(1.6);
  }
}

/* 響應式設計 */
@media (max-width: 768px) {
  .instagram-post {
    padding: 10px;
  }
  
  .post-container {
    max-width: 100%;
    height: 80vh;
    border-radius: 15px;
  }
  
  .post-bottom {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
  }
  
  .post-text {
    text-align: center;
  }
  
  .post-text p {
    font-size: 14px;
    padding: 12px 15px;
    max-width: 100%;
    margin: 0;
  }
  
  .username {
    font-size: 15px;
  }
  
  .action-buttons {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .post-text p {
    font-size: 13px;
    padding: 10px 12px;
  }
  
  .user-info {
    gap: 10px;
  }
  
  .avatar {
    width: 38px;
    height: 38px;
  }
  
  .post-bottom {
    gap: 10px;
  }
}
</style>