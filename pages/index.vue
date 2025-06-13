<template>
  <div class="container">
    <!-- 主標題區域 -->
    <div class="header">
      <h1 class="main-title">🎊 婚禮祝福牆</h1>
      <p class="subtitle">歡迎上傳照片或留言祝福，為我們留下美好回憶</p>
    </div>

    <!-- 導航區域 -->
    <div class="navigation">
      <el-row :gutter="16" justify="center">
        <el-col :span="6">
          <el-card shadow="hover" class="nav-card" @click="navigateTo('/wall')">
            <div class="nav-content">
              <el-icon size="32" class="nav-icon">
                <Picture />
              </el-icon>
              <h3>祝福牆</h3>
              <p>經典版輪播</p>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="nav-card styles-card" @click="navigateTo('/wall-styles')">
            <div class="nav-content">
              <el-icon size="32" class="nav-icon">
                <MagicStick />
              </el-icon>
              <h3>風格祝福牆</h3>
              <p>多種精美風格</p>
              <el-tag type="warning" size="small" class="new-tag">HOT</el-tag>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="nav-card" @click="navigateTo('/gallery')">
            <div class="nav-content">
              <el-icon size="32" class="nav-icon">
                <PhotoIcon />
              </el-icon>
              <h3>相簿</h3>
              <p>瀏覽所有照片</p>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="nav-card" @click="navigateTo('/upload')">
            <div class="nav-content">
              <el-icon size="32" class="nav-icon">
                <Upload />
              </el-icon>
              <h3>上傳祝福</h3>
              <p>留下美好回憶</p>
            </div>
          </el-card>
        </el-col>
      </el-row>
      
      <!-- 風格快捷按鈕 -->
      <div class="quick-styles">
        <el-divider>
          <span class="divider-text">🎨 快速體驗風格</span>
        </el-divider>
        
        <el-row :gutter="12" justify="center">
          <el-col :span="6">
            <el-button 
              type="primary" 
              @click="navigateTo('/wall-enhanced')"
              class="style-quick-btn"
            >
              <el-icon><Star /></el-icon>
              Instagram
            </el-button>
          </el-col>
          <el-col :span="6">
            <el-button 
              type="success" 
              @click="navigateTo('/wall-stories')"
              class="style-quick-btn"
            >
              <el-icon><VideoCamera /></el-icon>
              Stories
            </el-button>
          </el-col>
          <el-col :span="6">
            <el-button 
              type="info" 
              @click="navigateTo('/wall-magazine')"
              class="style-quick-btn"
            >
              <el-icon><Document /></el-icon>
              Magazine
            </el-button>
          </el-col>
          <el-col :span="6">
            <el-button 
              type="warning" 
              @click="navigateTo('/wall-polaroid')"
              class="style-quick-btn"
            >
              <el-icon><Picture /></el-icon>
              Polaroid
            </el-button>
          </el-col>
        </el-row>
      </div>
    </div>

    <!-- 背景圖片設定區域 -->
    <div class="background-section">
      <BackgroundUpload />
    </div>

    <!-- 祝福牆設定區域 -->
    <div class="settings-section">
      <WallSettings />
    </div>
    
    <!-- 祝福牆標題設定區域 -->
    <div class="title-settings-section">
      <WallTitleSettings />
    </div>

    <!-- 認證登入區域 -->
    <div class="auth-section">
      <el-divider>
        <span class="divider-text">💌 開始留下祝福</span>
      </el-divider>
      <div class="auth-hint">
        <p>點擊上方「上傳祝福」按鈕，填寫姓名並留下美好祝福！</p>
      </div>
    </div>

    <!-- 特色說明 -->
    <div class="features">
      <el-row :gutter="20">
        <el-col :span="8">
          <div class="feature-item">
            <el-icon size="24" color="#409EFF">
              <Upload />
            </el-icon>
            <h4>上傳照片</h4>
            <span>分享美好瞬間</span>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="feature-item">
            <el-icon size="24" color="#67C23A">
              <ChatDotRound />
            </el-icon>
            <h4>留言祝福</h4>
            <span>傳達溫馨心意</span>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="feature-item">
            <el-icon size="24" color="#E6A23C">
              <Star />
            </el-icon>
            <h4>即時展示</h4>
            <span>自動輪播顯示</span>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import BackgroundUpload from '~/components/BackgroundUpload.vue'
import WallSettings from '~/components/WallSettings.vue'
import WallTitleSettings from '~/components/WallTitleSettings.vue'
import { Picture, Upload, ChatDotRound, Star, MagicStick, VideoCamera, Document } from '@element-plus/icons-vue'

// 使用 Pinia Stores
const backgroundStore = useBackgroundStore()
const uiStore = useUIStore()

// 定義 PhotoIcon 組件
const PhotoIcon = {
  name: 'PhotoIcon',
  render() {
    return h('svg', {
      viewBox: '0 0 1024 1024',
      width: '1em',
      height: '1em',
      fill: 'currentColor'
    }, [
      h('path', {
        d: 'M928 160H96c-17.7 0-32 14.3-32 32v640c0 17.7 14.3 32 32 32h832c17.7 0 32-14.3 32-32V192c0-17.7-14.3-32-32-32zM896 792H128V224h768v568zM304 456a88 88 0 1 0 0-176 88 88 0 0 0 0 176zm0-116c15.5 0 28 12.5 28 28s-12.5 28-28 28-28-12.5-28-28 12.5-28 28-28zm462.2 195.2L730.7 487c-5.7-6.8-14.1-11-23-11s-17.3 4.2-23 11l-104.6 125.5-80.4-96.5c-5.7-6.8-14.1-11-23-11s-17.3 4.2-23 11L370.2 632.9c-11.7 14-2.9 35.1 14.8 35.1h457c17.7 0 26.5-21.1 14.8-35.1z'
      })
    ])
  }
}

// 設定頁面 meta
useHead({
  title: '婚禮祝福牆 - 留下美好回憶',
  meta: [
    { name: 'description', content: '歡迎來到婚禮祝福牆，上傳照片和留言祝福，與新人分享這個特別的時刻！' }
  ]
})

// 初始化頁面
onMounted(() => {
  // 設定當前頁面
  uiStore.setCurrentPage('home')
  
  // 強制從 MinIO 重新取得背景圖，確保與伺服器狀態同步
  backgroundStore.loadBackground(true)
  
  // 監聽頁面顯示事件（從其他頁面返回時重新載入）
  const handleVisibilityChange = () => {
    if (!document.hidden) {
      // 頁面重新顯示時強制重新載入背景
      backgroundStore.loadBackground(true)
    }
  }
  
  document.addEventListener('visibilitychange', handleVisibilityChange)
  
  // 監聽頁面焦點事件
  const handleFocus = () => {
    backgroundStore.loadBackground(true)
  }
  
  window.addEventListener('focus', handleFocus)
  
  // 清理事件監聽器
  onUnmounted(() => {
    document.removeEventListener('visibilitychange', handleVisibilityChange)
    window.removeEventListener('focus', handleFocus)
  })
})
</script>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1rem;
  min-height: calc(100vh - 80px);
}

/* 主標題區域 */
.header {
  text-align: center;
  margin-bottom: 3rem;
}

.main-title {
  font-size: 2.5rem;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
}

.subtitle {
  font-size: 1.1rem;
  color: #7f8c8d;
  margin-bottom: 0;
  line-height: 1.6;
}

/* 導航區域 */
.navigation {
  margin-bottom: 3rem;
}

.nav-card {
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 12px;
  border: 2px solid transparent;
}

.nav-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
  border-color: #409EFF;
}

.nav-card.styles-card {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  position: relative;
  overflow: hidden;
}

.nav-card.styles-card::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent);
  transform: rotate(45deg);
  animation: shimmer 3s infinite;
}

.nav-card.styles-card .nav-icon {
  color: #FFD700;
}

.nav-card.styles-card .nav-content h3 {
  color: white;
}

.nav-card.styles-card .nav-content p {
  color: rgba(255,255,255,0.9);
}

.nav-card.enhanced {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  position: relative;
  overflow: hidden;
}

.nav-card.enhanced::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent);
  transform: rotate(45deg);
  animation: shimmer 3s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
  100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
}

.nav-card.enhanced .nav-icon {
  color: #FFD700;
}

.nav-card.enhanced .nav-content h3 {
  color: white;
}

.nav-card.enhanced .nav-content p {
  color: rgba(255,255,255,0.9);
}

.new-tag {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 2;
}

.nav-content {
  text-align: center;
  padding: 1rem 0;
}

.nav-icon {
  color: #409EFF;
  margin-bottom: 0.5rem;
}

.nav-content h3 {
  margin: 0.5rem 0 0.25rem 0;
  color: #2c3e50;
  font-weight: 600;
}

.nav-content p {
  margin: 0;
  color: #7f8c8d;
  font-size: 0.9rem;
}

/* 背景設定區域 */
.background-section {
  margin-bottom: 2rem;
}

/* 祝福牆設定區域 */
.settings-section {
  margin-bottom: 2rem;
}

/* 認證區域 */
.auth-section {
  margin-bottom: 3rem;
}

.divider-text {
  color: #2c3e50;
  font-weight: bold;
  font-size: 1.2rem;
  padding: 0 1rem;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
}

.auth-hint {
  text-align: center;
  margin-top: 1rem;
}

.auth-hint p {
  color: #7f8c8d;
  font-size: 1rem;
  margin: 0;
}

/* 特色說明 */
.features {
  margin-top: 2rem;
}

.feature-item {
  text-align: center;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  margin-bottom: 1rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.feature-item h4 {
  margin: 0.5rem 0 0.25rem 0;
  color: #2c3e50;
  font-size: 1rem;
  font-weight: 600;
}

.feature-item span {
  color: #7f8c8d;
  font-size: 0.85rem;
}

/* 快速風格按鈕區域 */
.quick-styles {
  margin-top: 2rem;
  padding-top: 1rem;
}

.style-quick-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  padding: 10px 8px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.style-quick-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 響應式設計 */
@media (max-width: 768px) {
  .container {
    padding: 1rem 0.5rem;
  }
  
  .main-title {
    font-size: 2rem;
  }
  
  .subtitle {
    font-size: 1rem;
  }
  
  .nav-content {
    padding: 0.75rem 0;
  }
  
  .nav-content h3 {
    font-size: 1rem;
  }
  
  .nav-content p {
    font-size: 0.8rem;
  }
  
  .feature-item {
    margin-bottom: 0.75rem;
  }
  
  .style-quick-btn {
    font-size: 0.8rem;
    padding: 8px 6px;
  }
}

@media (max-width: 480px) {
  .main-title {
    font-size: 1.75rem;
  }
  
  .navigation .el-col {
    margin-bottom: 1rem;
  }
  
  .quick-styles .el-col {
    margin-bottom: 0.75rem;
  }
  
  .style-quick-btn {
    font-size: 0.75rem;
    padding: 6px 4px;
  }
}
</style>