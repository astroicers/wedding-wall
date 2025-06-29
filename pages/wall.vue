<template>
  <div class="wall-page" data-page="wall" :style="backgroundStyle">
    <!-- 返回按鈕 - 預設隱藏，滑鼠懸停時顯示 -->
    <div class="back-button-container">
      <div class="back-button" @click="navigateTo('/')">
        <el-icon size="20">
          <ArrowLeft />
        </el-icon>
        <span>返回首頁</span>
      </div>
    </div>
    
    <!-- 祝福牆標題 -->
    <div class="wall-header" v-if="messages.length > 0">
      <h1 class="wall-title" :style="{ 
        color: titleSettings.titleColor,
        fontFamily: getFontFamilyWithFallback(titleSettings.fontFamily),
        fontSize: titleSettings.fontSize + 'px'
      }">{{ titleSettings.wallTitle }}</h1>
      <p class="wall-subtitle" v-if="titleSettings.wallSubtitle" :style="{ 
        color: titleSettings.titleColor,
        fontFamily: getFontFamilyWithFallback(titleSettings.fontFamily),
        fontSize: (titleSettings.fontSize * 0.5) + 'px'
      }">{{ titleSettings.wallSubtitle }}</p>
    </div>
    
    <!-- 祝福牆內容 -->
    <div class="wall" v-if="messages.length > 0">
      <div class="message-container">
        <transition name="fade" mode="out-in">
          <MessageCard :message="messages[current]" :key="current" />
        </transition>
      </div>
      
      <!-- 進度指示器 -->
      <div class="progress-indicator">
        <span 
          v-for="(msg, index) in messages" 
          :key="index"
          class="progress-dot"
          :class="{ active: index === current }"
        ></span>
      </div>
    </div>
    
    <!-- 空狀態 -->
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
  import MessageCard from '~/components/MessageCard.vue'
  import { ArrowLeft, Picture } from '@element-plus/icons-vue'
  
  const current = ref(0)
  const titleSettings = ref({
    wallTitle: '婚禮祝福牆',
    wallSubtitle: '',
    titleColor: '#ffffff',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    fontSize: 48
  })
  
  // 使用 Pinia Stores
  const messagesStore = useMessagesStore()
  const backgroundStore = useBackgroundStore()
  const uiStore = useUIStore()
  
  // 響應式資料
  const messages = computed(() => messagesStore.messages)

  // 設定頁面 meta
  useHead({
    title: '祝福牆 - 婚禮祝福牆',
    meta: [
      { name: 'description', content: '即時輪播展示所有婚禮祝福訊息和照片' }
    ]
  })

  // 計算背景樣式，使用 Pinia store 的快取安全 URL
  const backgroundStyle = computed(() => {
    const bgUrl = backgroundStore.cachedBackgroundUrl
    if (bgUrl) {
      return {
        backgroundImage: `url(${bgUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }
    }
    return {}
  })

  
  // 使用 Google Fonts 工具
  const { isGoogleFont, getFontFamilyWithFallback, loadGoogleFont } = useGoogleFonts()

  // 載入標題設定
  const loadTitleSettings = () => {
    try {
      const settings = localStorage.getItem('wallTitleSettings')
      if (settings) {
        titleSettings.value = { ...titleSettings.value, ...JSON.parse(settings) }
        
        // 載入 Google Font（如果需要）
        if (titleSettings.value.fontFamily) {
          loadGoogleFont(titleSettings.value.fontFamily)
        }
      }
    } catch (error) {
      console.error('載入標題設定失敗:', error)
    }
  }
  
  onMounted(async () => {
    // 設定當前頁面
    uiStore.setCurrentPage('wall')
    
    // 載入標題設定
    loadTitleSettings()
    
    // 使用 Pinia stores 載入資料
    await Promise.all([
      messagesStore.fetchMessages(),
      backgroundStore.loadBackground(true)
    ])
  
    // 每3秒切換到下一則訊息
    setInterval(() => {
      if (messages.value.length > 0) {
        current.value = (current.value + 1) % messages.value.length
      }
    }, 3000)
  
    // 每5秒重新載入訊息（背景載入，不顯示錯誤）
    setInterval(() => {
      messagesStore.fetchMessages(false)
    }, 5000)
    
    // 每30秒重新檢查背景圖片是否有更新
    setInterval(() => {
      backgroundStore.loadBackground()
    }, 30000)
    
    // 監聽背景更新訊息
    const handleBackgroundUpdate = (event: MessageEvent) => {
      if (event.data && event.data.type === 'BACKGROUND_UPDATED') {
        // 強制重新載入背景
        backgroundStore.loadBackground(true)
      }
    }
    
    // 監聽標題更新
    const handleTitleUpdate = (event: CustomEvent) => {
      titleSettings.value = { ...titleSettings.value, ...event.detail }
      
      // 載入 Google Font（如果需要）
      if (event.detail.fontFamily) {
        loadGoogleFont(event.detail.fontFamily)
      }
    }
    
    window.addEventListener('message', handleBackgroundUpdate)
    window.addEventListener('wallTitleUpdated', handleTitleUpdate)
    
    // 清理事件監聽器
    onUnmounted(() => {
      window.removeEventListener('message', handleBackgroundUpdate)
      window.removeEventListener('wallTitleUpdated', handleTitleUpdate)
    })
  })
  </script>
  
  <style scoped>
  .wall-page {
    width: 100vw;
    height: 100vh;
    background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
    position: fixed;
    top: 0;
    left: 0;
    z-index: 9999;
    overflow: hidden;
    display: flex;
    flex-direction: column;
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
  
  .message-container {
    width: 100%;
    max-width: 800px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  /* 進度指示器 */
  .progress-indicator {
    position: absolute;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 0.5rem;
    padding: 0.75rem;
    background: rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(10px);
    border-radius: 30px;
  }
  
  .progress-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    transition: all 0.3s ease;
  }
  
  .progress-dot.active {
    background: white;
    transform: scale(1.5);
    box-shadow: 0 0 10px rgba(255, 255, 255, 0.6);
  }
  
  /* 轉場動畫 */
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.5s ease;
  }
  
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }

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
    .back-button-container {
      width: 100px;
      height: 70px;
    }
    
    .back-button {
      top: 15px;
      left: 15px;
      padding: 0.5rem 0.75rem;
    }
    
    .back-button span {
      font-size: 0.8rem;
    }
    
    .wall-title {
      font-size: 2rem;
    }
    
    .wall-subtitle {
      font-size: 1rem;
    }
    
    .wall {
      padding: 1rem;
    }
    
    .progress-indicator {
      bottom: 1rem;
    }
  }

  @media (max-width: 480px) {
    .back-button-container {
      width: 80px;
      height: 60px;
    }
    
    .back-button {
      top: 10px;
      left: 10px;
      padding: 0.5rem;
    }
    
    .back-button span {
      display: none;
    }
    
    .wall-title {
      font-size: 1.5rem;
    }
    
    .wall-subtitle {
      font-size: 0.9rem;
    }
    
    .wall {
      padding: 0.5rem;
    }
    
    .progress-indicator {
      bottom: 0.5rem;
      padding: 0.5rem;
    }
    
    .progress-dot {
      width: 6px;
      height: 6px;
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