<template>
  <div class="stories-wall" data-page="wall-stories" :style="backgroundStyle">
    <div class="back-button-container">
      <div class="back-button" @click="goBack">
        <el-icon size="20">
          <ArrowLeft />
        </el-icon>
        <span>返回</span>
      </div>
    </div>
    
    <!-- Loading State -->
    <div v-if="loading" class="loading-stories">
      <el-skeleton animated class="skeleton-story">
        <template #template>
          <el-skeleton-item variant="image" class="skeleton-image" />
          <div class="skeleton-content">
            <el-skeleton-item variant="circle" class="skeleton-avatar" />
            <el-skeleton-item variant="text" style="width: 150px" />
          </div>
        </template>
      </el-skeleton>
    </div>

    <!-- Stories View -->
    <div v-else-if="messages.length > 0" class="stories-wrapper">
      <!-- Stories List -->
      <div class="stories-list">
        <div
          v-for="(message, index) in messages"
          :key="message.id || message.timestamp || index"
          class="story-item"
          :class="{ active: index === currentIndex }"
          @click="selectStory(index)"
        >
          <div class="story-ring">
            <img
              :src="`/api/image/${message.imagePath}`"
              :alt="message.name"
              class="story-thumbnail"
            />
          </div>
          <div class="story-name">{{ message.name }}</div>
        </div>
      </div>

      <!-- Current Story -->
      <div class="story-viewer" @click="handleStoryClick">
        <div class="story-progress">
          <div
            v-for="(message, index) in messages"
            :key="`progress-${message.id || message.timestamp || index}`"
            class="progress-segment"
            :class="{ active: index === currentIndex, viewed: index < currentIndex }"
          >
            <div 
              v-if="index === currentIndex" 
              class="progress-fill"
              :style="{ width: `${progress}%` }"
            ></div>
          </div>
        </div>

        <div class="story-header">
          <div class="story-author">
            <div class="author-avatar">
              {{ currentMessage.name?.charAt(0) || '?' }}
            </div>
            <div class="author-info">
              <div class="author-name">{{ currentMessage.name }}</div>
              <div class="story-time">{{ getRelativeTime(currentMessage.createdAt) }}</div>
            </div>
          </div>
          <button @click.stop="closeStories" class="close-button">
            <el-icon><Close /></el-icon>
          </button>
        </div>

        <div class="story-content">
          <img
            :src="`/api/image/${currentMessage.imagePath}`"
            :alt="currentMessage.name"
            class="story-image"
          />
          <div class="story-overlay">
            <p class="story-message">{{ currentMessage.message }}</p>
          </div>
        </div>

        <!-- Navigation Areas -->
        <div class="nav-area nav-prev" @click.stop="previousStory"></div>
        <div class="nav-area nav-next" @click.stop="nextStory"></div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <el-icon size="64" color="white">
        <Film />
      </el-icon>
      <h3>還沒有祝福訊息</h3>
      <p>快去上傳第一則祝福吧！</p>
      <el-button type="primary" @click="goBack">返回管理</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Close, ArrowLeft, Film } from '@element-plus/icons-vue'

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

const currentIndex = ref(0)
const progress = ref(0)
const progressTimer = ref(null)
const isPlaying = ref(true)

const backgroundStyle = computed(() => {
  if (props.wallSettings.backgroundColor) {
    return { background: props.wallSettings.backgroundColor }
  }
  return { background: '#000000' }
})

const currentMessage = computed(() => props.messages[currentIndex.value] || {})

const STORY_DURATION = computed(() => (props.wallSettings.autoplayDelay || 4) * 1000) // Use dynamic autoplay delay

// Start progress animation
const startProgress = () => {
  clearInterval(progressTimer.value)
  progress.value = 0
  
  if (isPlaying.value) {
    progressTimer.value = setInterval(() => {
      progress.value += 100 / (STORY_DURATION.value / 100)
      
      if (progress.value >= 100) {
        nextStory()
      }
    }, 100)
  }
}

// Select a story
const selectStory = (index) => {
  currentIndex.value = index
  startProgress()
}

// Navigate to previous story
const previousStory = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
    startProgress()
  }
}

// Navigate to next story
const nextStory = () => {
  if (currentIndex.value < props.messages.length - 1) {
    currentIndex.value++
    startProgress()
  } else {
    // Loop back to first story
    currentIndex.value = 0
    startProgress()
  }
}

// Handle story click
const handleStoryClick = (e) => {
  const rect = e.currentTarget.getBoundingClientRect()
  const x = e.clientX - rect.left
  const width = rect.width
  
  if (x < width / 2) {
    previousStory()
  } else {
    nextStory()
  }
}

// Close stories (pause)
const closeStories = () => {
  isPlaying.value = false
  clearInterval(progressTimer.value)
}

// Get relative time
const getRelativeTime = (timestamp) => {
  const now = Date.now()
  const diff = now - timestamp
  const hours = Math.floor(diff / (1000 * 60 * 60))
  
  if (hours < 1) {
    const minutes = Math.floor(diff / (1000 * 60))
    return `${minutes} 分鐘前`
  } else if (hours < 24) {
    return `${hours} 小時前`
  } else {
    const days = Math.floor(hours / 24)
    return `${days} 天前`
  }
}

// Start playing when component mounts
onMounted(() => {
  if (props.messages.length > 0) {
    startProgress()
  }
})

// Cleanup on unmount
onUnmounted(() => {
  clearInterval(progressTimer.value)
})

const goBack = () => {
  router.push(`/${props.userId}/walls/${props.wallId}`)
}

useHead({
  title: 'Stories 祝福牆 - 婚禮祝福牆',
  meta: [
    { name: 'description', content: 'Stories 風格祝福牆，全螢幕沉浸體驗' }
  ]
})
</script>

<style scoped>
.stories-wall {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: #000;
  overflow: hidden;
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

.stories-wall:hover .back-button-container {
  opacity: 1;
  transform: translateX(0);
}

.back-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.95);
  color: #333;
  border-radius: 25px;
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
}

.back-button:hover {
  background: white;
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
}

/* Loading State */
.loading-stories {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.skeleton-story {
  width: 400px;
  max-width: 90%;
}

.skeleton-image {
  width: 100%;
  height: 600px;
  border-radius: 12px;
}

.skeleton-content {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
}

.skeleton-avatar {
  width: 40px;
  height: 40px;
}

/* Stories Wrapper */
.stories-wrapper {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* Stories List */
.stories-list {
  display: flex;
  gap: 15px;
  padding: 20px;
  overflow-x: auto;
  background: rgba(0, 0, 0, 0.8);
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
}

.story-item {
  flex-shrink: 0;
  cursor: pointer;
  text-align: center;
  transition: all 0.3s ease;
}

.story-item:hover {
  transform: scale(1.05);
}

.story-ring {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  padding: 3px;
  background: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888);
  margin-bottom: 5px;
}

.story-item.active .story-ring {
  background: #999;
}

.story-thumbnail {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #000;
}

.story-name {
  font-size: 12px;
  color: white;
  max-width: 70px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Story Viewer */
.story-viewer {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  padding-top: 100px;
}

/* Progress Bar */
.story-progress {
  position: absolute;
  top: 110px;
  left: 50%;
  transform: translateX(-50%);
  width: 400px;
  max-width: 90%;
  display: flex;
  gap: 5px;
  z-index: 20;
}

.progress-segment {
  flex: 1;
  height: 3px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
  overflow: hidden;
  position: relative;
}

.progress-segment.viewed {
  background: rgba(255, 255, 255, 0.8);
}

.progress-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: white;
  transition: width 0.1s linear;
}

/* Story Header */
.story-header {
  position: absolute;
  top: 130px;
  left: 50%;
  transform: translateX(-50%);
  width: 400px;
  max-width: 90%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 20;
  padding: 15px;
}

.story-author {
  display: flex;
  align-items: center;
  gap: 10px;
}

.author-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #409eff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 18px;
}

.author-info {
  color: white;
}

.author-name {
  font-weight: bold;
  font-size: 14px;
}

.story-time {
  font-size: 12px;
  opacity: 0.8;
}

.close-button {
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  padding: 5px;
}

/* Story Content */
.story-content {
  position: relative;
  width: 400px;
  max-width: 90%;
  height: 70vh;
  max-height: 600px;
  border-radius: 12px;
  overflow: hidden;
  background: #222;
}

.story-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.story-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  padding: 30px 20px 20px;
  color: white;
}

.story-message {
  font-size: 16px;
  line-height: 1.5;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}

/* Navigation Areas */
.nav-area {
  position: absolute;
  top: 200px;
  bottom: 0;
  width: 40%;
  cursor: pointer;
}

.nav-prev {
  left: 0;
}

.nav-next {
  right: 0;
}

/* Empty State */
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
  font-weight: 600;
}

.empty-state p {
  font-size: 1.2rem;
  margin: 0;
  opacity: 0.8;
}

/* Responsive Design */
@media (max-width: 768px) {
  .stories-list {
    padding: 15px;
  }
  
  .story-ring {
    width: 50px;
    height: 50px;
  }
  
  .story-content {
    width: 100%;
    max-width: 100%;
    height: 80vh;
    border-radius: 0;
  }
  
  .story-progress,
  .story-header {
    width: 100%;
    max-width: 100%;
  }
}
</style>