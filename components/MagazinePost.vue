<template>
  <div class="magazine-post">
    <div class="magazine-container" :class="{ 'has-image': message.photo }">
      <div 
        v-if="message.photo" 
        class="magazine-image"
        :style="{ backgroundImage: `url(${message.photo})` }"
      ></div>
      
      <div class="magazine-content">
        <div class="magazine-header">
          <div class="issue-number">Issue #{{ issueNumber }}</div>
          <div class="date">{{ formatDate(new Date()) }}</div>
        </div>
        
        <div class="magazine-title">
          <h1>{{ message.name }}</h1>
          <div class="title-underline"></div>
        </div>
        
        <div class="magazine-body" :class="{ 'side-layout': isLongText }">
          <div class="quote-mark" v-if="!isLongText">"</div>
          <p class="magazine-text">{{ message.text }}</p>
          <div class="author-signature">— {{ message.name }}</div>
        </div>
        
        <div class="magazine-footer">
          <div class="decorative-border"></div>
          <div class="footer-text">Wedding Memories</div>
        </div>
      </div>
      
      <div v-if="!message.photo" class="magazine-pattern"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ 
  message: { 
    name: string
    text: string
    photo?: string 
    timestamp?: number
  }
}>()

const isLongText = computed(() => (props.message.text || '').length > 80)

const issueNumber = computed(() => {
  if (props.message.timestamp) {
    return String(props.message.timestamp).slice(-3)
  }
  return Math.floor(Math.random() * 999) + 1
})

const formatDate = (date: Date) => {
  return date.toLocaleDateString('zh-TW', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}
</script>

<style scoped>
.magazine-post {
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 40px;
}

.magazine-container {
  position: relative;
  width: 100%;
  max-width: 800px;
  height: 90vh;
  background: #fff;
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.1),
    0 0 0 1px rgba(0, 0, 0, 0.05);
  display: flex;
  overflow: hidden;
}

.magazine-container.has-image {
  flex-direction: row;
}

.magazine-container:not(.has-image) {
  flex-direction: column;
}

.magazine-container.has-image .magazine-body.side-layout {
  position: absolute;
  right: 20px;
  bottom: 20px;
  width: 300px;
  background: rgba(255, 255, 255, 0.95);
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.magazine-image {
  flex: 1;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
}

.magazine-image::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, 
    rgba(0,0,0,0.1) 0%, 
    rgba(0,0,0,0.05) 50%, 
    rgba(255,255,255,0.1) 100%);
}

.magazine-content {
  flex: 1;
  padding: 60px 50px;
  display: flex;
  flex-direction: column;
  background: #fff;
  position: relative;
}

.magazine-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  padding-bottom: 20px;
  border-bottom: 2px solid #2c3e50;
}

.issue-number {
  font-family: 'Georgia', serif;
  font-size: 14px;
  font-weight: bold;
  color: #2c3e50;
  letter-spacing: 2px;
  text-transform: uppercase;
}

.date {
  font-family: 'Georgia', serif;
  font-size: 14px;
  color: #7f8c8d;
  font-style: italic;
}

.magazine-title {
  margin-bottom: 40px;
}

.magazine-title h1 {
  font-family: 'Georgia', serif;
  font-size: 2.5rem;
  color: #2c3e50;
  margin: 0 0 15px 0;
  line-height: 1.2;
  font-weight: bold;
}

.title-underline {
  width: 80px;
  height: 4px;
  background: linear-gradient(90deg, #3498db, #2980b9);
  margin: 0;
}

.magazine-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
}

.magazine-body:not(.side-layout) {
  justify-content: flex-end;
  padding-bottom: 40px;
}

.magazine-body.side-layout {
  justify-content: center;
}

.quote-mark {
  font-family: 'Georgia', serif;
  font-size: 4rem;
  color: #bdc3c7;
  position: absolute;
  top: -20px;
  left: -10px;
  line-height: 1;
}

.magazine-text {
  font-family: 'Georgia', serif;
  font-size: 1.2rem;
  line-height: 1.6;
  color: #2c3e50;
  margin: 0 0 20px 0;
  text-align: left;
  position: relative;
  z-index: 1;
}

.magazine-body:not(.side-layout) .magazine-text {
  text-align: right;
  font-size: 1.3rem;
  line-height: 1.8;
}

.author-signature {
  font-family: 'Georgia', serif;
  font-size: 1rem;
  color: #7f8c8d;
  text-align: right;
  font-style: italic;
}

.magazine-footer {
  margin-top: 40px;
  text-align: center;
}

.decorative-border {
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    #bdc3c7 20%, 
    #2c3e50 50%, 
    #bdc3c7 80%, 
    transparent 100%);
  margin-bottom: 20px;
}

.footer-text {
  font-family: 'Georgia', serif;
  font-size: 12px;
  color: #95a5a6;
  letter-spacing: 3px;
  text-transform: uppercase;
}

.magazine-pattern {
  position: absolute;
  top: 0;
  right: 0;
  width: 200px;
  height: 200px;
  background: linear-gradient(45deg, 
    transparent 40%, 
    rgba(52, 152, 219, 0.05) 50%, 
    transparent 60%);
  background-size: 30px 30px;
  opacity: 0.3;
}

/* 無圖片時的佈局調整 */
.magazine-container:not(.has-image) .magazine-content {
  padding: 80px 80px;
}

.magazine-container:not(.has-image) .magazine-title h1 {
  font-size: 3rem;
  text-align: center;
}

.magazine-container:not(.has-image) .magazine-text {
  font-size: 1.5rem;
  text-align: center;
  text-indent: 0;
}

.magazine-container:not(.has-image) .title-underline {
  margin: 0 auto;
  width: 120px;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .magazine-post {
    padding: 20px;
  }
  
  .magazine-container {
    flex-direction: column !important;
    max-width: 100%;
    height: 95vh;
  }
  
  .magazine-image {
    flex: 0 0 40%;
  }
  
  .magazine-content {
    padding: 40px 30px;
  }
  
  .magazine-title h1 {
    font-size: 2rem;
  }
  
  .magazine-text {
    font-size: 1.1rem;
    line-height: 1.6;
  }
  
  .quote-mark {
    font-size: 3rem;
    top: -15px;
  }
}

@media (max-width: 480px) {
  .magazine-content {
    padding: 30px 20px;
  }
  
  .magazine-title h1 {
    font-size: 1.8rem;
  }
  
  .magazine-text {
    font-size: 1rem;
  }
  
  .magazine-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style>