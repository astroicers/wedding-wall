<template>
  <div class="stories-post">
    <div class="story-container" :class="{ 'has-image': message.photo }">
      <div 
        v-if="message.photo" 
        class="story-background"
        :style="{ backgroundImage: `url(${message.photo})` }"
      ></div>
      
      <div v-else class="story-gradient-bg"></div>
      
      <div class="story-overlay"></div>
      
      <div class="story-content">
        <div class="story-header">
          <div class="user-avatar">
            <el-icon size="20">
              <User />
            </el-icon>
          </div>
          <div class="user-name">{{ message.name }}</div>
          <div class="story-time">剛剛</div>
        </div>
        
        <div class="story-text" :class="{ 'long-text': isLongText }">
          <p>{{ message.text }}</p>
        </div>
        
        <div class="story-footer">
          <div class="story-actions">
            <div class="action-btn" @click="handleLike">
              <el-icon size="24">
                <Star />
              </el-icon>
            </div>
            <div class="action-btn">
              <el-icon size="24">
                <Share />
              </el-icon>
            </div>
          </div>
        </div>
      </div>
      
      <div class="progress-indicator">
        <div class="progress-bar" :style="{ width: progressWidth }"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { User, Star, Share } from '@element-plus/icons-vue'

const props = defineProps<{ 
  message: { 
    name: string
    text: string
    photo?: string 
  }
  progress?: number
}>()

const isLongText = computed(() => (props.message.text || '').length > 60)

const progressWidth = computed(() => `${props.progress || 0}%`)

const handleLike = () => {
  // 愛心動畫效果
}
</script>

<style scoped>
.stories-post {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
}

.story-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #000;
  display: flex;
  flex-direction: column;
}

/* 嚴格維持 9:16 比例 */
.story-container {
  aspect-ratio: 9/16;
  width: 100%;
  height: 100%;
  max-width: 100%;
  max-height: 100%;
}

.story-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.story-gradient-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, 
    #ff6b6b, #ffd93d, #6bcf7f, #4ecdc4, #45b7d1, #96ceb4, #feca57, #ff9ff3);
  background-size: 400% 400%;
  animation: gradientFlow 10s ease infinite;
}

@keyframes gradientFlow {
  0% { background-position: 0% 50%; }
  25% { background-position: 100% 50%; }
  50% { background-position: 100% 100%; }
  75% { background-position: 0% 100%; }
  100% { background-position: 0% 50%; }
}

.story-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.4) 0%,
    rgba(0, 0, 0, 0.1) 30%,
    rgba(0, 0, 0, 0.1) 70%,
    rgba(0, 0, 0, 0.6) 100%
  );
}

.story-content {
  position: relative;
  z-index: 2;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 60px 20px 40px;
  color: white;
}

.story-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
}

.user-name {
  font-weight: 600;
  font-size: 16px;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}

.story-time {
  font-size: 12px;
  opacity: 0.8;
  margin-left: auto;
}

.story-text {
  position: fixed;
  bottom: 120px;
  right: 20px;
  max-width: 280px;
  text-align: right;
  z-index: 10;
}

.story-text.long-text {
  position: fixed;
  top: 50%;
  right: 20px;
  transform: translateY(-50%);
  max-width: 220px;
  bottom: auto;
  text-align: right;
  z-index: 10;
}

.story-text p {
  font-size: 18px;
  line-height: 1.4;
  font-weight: 500;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.8);
  margin: 0;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.5));
  padding: 16px 20px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  text-align: right;
}

.story-footer {
  align-self: center;
}

.story-actions {
  display: flex;
  justify-content: center;
  gap: 30px;
}

.action-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.action-btn:active {
  transform: scale(0.95);
}

.progress-indicator {
  position: absolute;
  top: 20px;
  left: 20px;
  right: 20px;
  height: 3px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
  z-index: 3;
}

.progress-bar {
  height: 100%;
  background: white;
  border-radius: 2px;
  transition: width 0.1s linear;
}

/* 確保內容填滿整個容器 */
.story-background,
.story-gradient-bg,
.story-overlay {
  width: 100%;
  height: 100%;
}

@media (max-width: 768px) {
  .story-container {
    max-width: 100%;
  }
  
  .story-content {
    padding: 50px 16px 30px;
  }
  
  .story-text p {
    font-size: 18px;
    padding: 16px 20px;
    max-width: 280px;
  }
  
  .action-btn {
    width: 44px;
    height: 44px;
  }
}

@media (max-width: 480px) {
  .story-text p {
    font-size: 16px;
    padding: 14px 18px;
  }
  
  .user-name {
    font-size: 15px;
  }
  
  .action-btn {
    width: 40px;
    height: 40px;
  }
}
</style>