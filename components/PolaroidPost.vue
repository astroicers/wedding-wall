<template>
  <div class="polaroid-post">
    <div class="polaroid-container">
      <div class="polaroid-photo">
        <div 
          v-if="message.photo"
          class="photo-image"
          :style="{ backgroundImage: `url(${message.photo})` }"
        ></div>
        
        <div v-else class="text-only-photo-area">
          <div class="text-blessing-content">
            <div class="text-icon">
              <el-icon size="32" color="#3498db">
                <Picture />
              </el-icon>
            </div>
            <p class="blessing-main-text">{{ message.text }}</p>
            <div class="text-frame-decoration"></div>
          </div>
        </div>
        
        <div class="photo-shine"></div>
      </div>
      
      <div class="polaroid-caption">
        <div v-if="message.photo" class="handwritten-text" :class="{ 'side-layout': isLongText }">
          <div class="message-text">{{ message.text }}</div>
          <div class="signature">{{ message.name }}</div>
          <div class="date">{{ formatDate(new Date()) }}</div>
        </div>
        
        <!-- 純文字模式下只顯示姓名和日期 -->
        <div v-else class="text-only-caption">
          <div class="signature">{{ message.name }}</div>
          <div class="date">{{ formatDate(new Date()) }}</div>
        </div>
        
        <div class="decorative-elements">
          <div class="heart">♥</div>
          <div class="stars">✨</div>
        </div>
      </div>
      
      <div class="tape tape-top"></div>
      <div class="tape tape-bottom"></div>
    </div>
    
    <div class="shadow"></div>
  </div>
</template>

<script setup lang="ts">
import { Picture } from '@element-plus/icons-vue'

const props = defineProps<{ 
  message: { 
    name: string
    text: string
    photo?: string 
    timestamp?: number
  }
}>()

const isLongText = computed(() => props.message.text.length > 60)

const formatDate = (date: Date) => {
  return date.toLocaleDateString('zh-TW', { 
    month: 'short', 
    day: 'numeric' 
  })
}
</script>

<style scoped>
.polaroid-post {
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  padding: 40px;
  position: relative;
}

.polaroid-post::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 30%, rgba(255,255,255,0.1) 1px, transparent 1px),
    radial-gradient(circle at 80% 70%, rgba(255,255,255,0.1) 1px, transparent 1px),
    radial-gradient(circle at 40% 80%, rgba(255,255,255,0.05) 1px, transparent 1px);
  background-size: 100px 100px, 150px 150px, 80px 80px;
  animation: float 20s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

.polaroid-container {
  position: relative;
  width: 350px;
  height: 450px;
  background: #fff;
  padding: 20px 20px 60px 20px;
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.15),
    0 0 20px rgba(0, 0, 0, 0.1);
  transform: rotate(-2deg);
  transition: all 0.3s ease;
  z-index: 2;
}

.polaroid-container:hover {
  transform: rotate(0deg) scale(1.05);
  box-shadow: 
    0 30px 60px rgba(0, 0, 0, 0.2),
    0 0 30px rgba(0, 0, 0, 0.15);
}

.polaroid-photo {
  width: 100%;
  height: 260px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  position: relative;
  overflow: hidden;
}

.photo-image {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

/* 純文字模式照片區域 */
.text-only-photo-area {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #74b9ff, #0984e3);
  color: white;
  position: relative;
}

.text-blessing-content {
  text-align: center;
  padding: 1.5rem;
  max-width: 90%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.text-icon {
  margin-bottom: 0.5rem;
  opacity: 0.8;
}

.blessing-main-text {
  font-family: 'Courier New', monospace;
  font-size: 1.1rem;
  font-weight: 600;
  line-height: 1.4;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  margin: 0;
  word-wrap: break-word;
  overflow-wrap: break-word;
  text-align: center;
}

.text-frame-decoration {
  width: 60px;
  height: 2px;
  background: rgba(255, 255, 255, 0.7);
  margin-top: 0.5rem;
}

/* 純文字模式底部區域 */
.text-only-caption {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  gap: 0.5rem;
}

.text-only-caption .signature {
  font-family: 'Courier New', monospace;
  font-size: 18px;
  color: #3498db;
  font-weight: bold;
  margin-bottom: 0;
}

.text-only-caption .date {
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: #7f8c8d;
  margin: 0;
}

.photo-shine {
  position: absolute;
  top: 20px;
  left: 20px;
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, 
    rgba(255,255,255,0.3) 0%, 
    rgba(255,255,255,0.1) 50%, 
    transparent 100%);
  border-radius: 50%;
  opacity: 0.7;
}

.polaroid-caption {
  padding: 20px 10px 0;
  height: 130px;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.handwritten-text {
  flex: 1;
  position: relative;
}

.handwritten-text:not(.side-layout) {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: flex-end;
  text-align: right;
}

.handwritten-text.side-layout {
  position: absolute;
  right: -80px;
  top: -260px;
  width: 150px;
  background: rgba(255, 255, 255, 0.95);
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  border: 1px solid #e9ecef;
  z-index: 10;
}

.message-text {
  font-family: 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.4;
  color: #2c3e50;
  margin-bottom: 15px;
  text-align: right;
  transform: rotate(-0.5deg);
}

.handwritten-text.side-layout .message-text {
  transform: none;
  text-align: left;
  font-size: 12px;
  margin-bottom: 10px;
}

.signature {
  font-family: 'Courier New', monospace;
  font-size: 16px;
  color: #3498db;
  text-align: right;
  transform: rotate(0.8deg);
  margin-bottom: 8px;
  font-weight: bold;
}

.handwritten-text.side-layout .signature {
  transform: none;
  font-size: 14px;
  margin-bottom: 6px;
}

.date {
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: #7f8c8d;
  text-align: right;
  transform: rotate(-0.3deg);
}

.handwritten-text.side-layout .date {
  transform: none;
  font-size: 10px;
}

.decorative-elements {
  position: absolute;
  bottom: 10px;
  left: 10px;
  display: flex;
  gap: 15px;
}

.heart {
  color: #e74c3c;
  font-size: 18px;
  transform: rotate(-15deg);
  animation: heartbeat 2s ease-in-out infinite;
}

.stars {
  color: #f39c12;
  font-size: 16px;
  transform: rotate(10deg);
  animation: twinkle 3s ease-in-out infinite;
}

@keyframes heartbeat {
  0%, 100% { transform: rotate(-15deg) scale(1); }
  50% { transform: rotate(-15deg) scale(1.2); }
}

@keyframes twinkle {
  0%, 100% { opacity: 1; transform: rotate(10deg); }
  50% { opacity: 0.5; transform: rotate(15deg); }
}

.tape {
  position: absolute;
  width: 60px;
  height: 25px;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(0, 0, 0, 0.1);
  transform-origin: center;
}

.tape-top {
  top: -10px;
  left: 30px;
  transform: rotate(-8deg);
  background: linear-gradient(45deg, 
    rgba(255,255,255,0.8) 0%, 
    rgba(240,240,240,0.8) 100%);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.tape-bottom {
  bottom: -10px;
  right: 40px;
  transform: rotate(12deg);
  background: linear-gradient(45deg, 
    rgba(255,255,255,0.8) 0%, 
    rgba(240,240,240,0.8) 100%);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.shadow {
  position: absolute;
  width: 350px;
  height: 450px;
  background: rgba(0, 0, 0, 0.15);
  border-radius: 2px;
  transform: rotate(-2deg) translateX(10px) translateY(10px);
  z-index: 1;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .polaroid-post {
    padding: 20px;
  }
  
  .polaroid-container {
    width: 300px;
    height: 380px;
    padding: 15px 15px 50px 15px;
  }
  
  .polaroid-photo {
    height: 220px;
  }
  
  .polaroid-caption {
    height: 110px;
    padding: 15px 8px 0;
  }
  
  .message-text {
    font-size: 13px;
    margin-bottom: 12px;
  }
  
  .signature {
    font-size: 14px;
  }
  
  .shadow {
    width: 300px;
    height: 380px;
  }
}

@media (max-width: 480px) {
  .polaroid-container {
    width: 280px;
    height: 360px;
  }
  
  .polaroid-photo {
    height: 200px;
  }
  
  .message-text {
    font-size: 12px;
  }
  
  .signature {
    font-size: 13px;
  }
  
  .shadow {
    width: 280px;
    height: 360px;
  }
}
</style>