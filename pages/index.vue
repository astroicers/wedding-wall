<template>
  <div class="home-page">
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <el-loading-directive
        v-loading="true"
        element-loading-text="載入中..."
        element-loading-background="rgba(0, 0, 0, 0.8)"
      />
    </div>

    <!-- Welcome Screen for Unauthenticated Users -->
    <div v-else-if="!authStore.isAuthenticated" class="welcome-screen">
      <!-- Hero Section -->
      <div class="hero-section">
        <div class="hero-content">
          <div class="hero-title">
            <h1 class="main-title">🎊 婚禮祝福牆</h1>
            <p class="subtitle">分享美好瞬間，留下永恆祝福</p>
          </div>
          <div class="hero-actions">
            <el-button 
              type="primary" 
              size="large" 
              @click="handleLogin" 
              class="primary-btn"
            >
              <el-icon><User /></el-icon>
              開始使用
            </el-button>
          </div>
        </div>
      </div>

      <!-- Features Section -->
      <div class="features-section">
        <div class="section-header">
          <h2>功能特色</h2>
          <p>多種展示方式，讓每一份祝福都閃閃發光</p>
        </div>
        
        <div class="feature-grid">
          <div class="feature-card">
            <div class="card-icon">
              <el-icon size="40"><Picture /></el-icon>
            </div>
            <div class="card-content">
              <h3>多種展示風格</h3>
              <p>網格、拍立得、雜誌、故事等多種風格</p>
            </div>
          </div>

          <div class="feature-card">
            <div class="card-icon">
              <el-icon size="40"><Upload /></el-icon>
            </div>
            <div class="card-content">
              <h3>簡易上傳</h3>
              <p>三步驟輕鬆上傳照片和祝福</p>
            </div>
          </div>

          <div class="feature-card">
            <div class="card-icon">
              <el-icon size="40"><Share /></el-icon>
            </div>
            <div class="card-content">
              <h3>多租戶支持</h3>
              <p>每個用戶擁有獨立的祝福牆空間</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Authenticated User - Redirect Message -->
    <div v-else class="redirect-message">
      <div class="redirect-content">
        <el-icon size="60"><Loading /></el-icon>
        <p>正在重定向到您的祝福牆...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { 
  Picture, 
  Upload, 
  User,
  Share,
  Loading
} from '@element-plus/icons-vue'

import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
const router = useRouter()
const loading = ref(true)

// 頁面初始化
onMounted(async () => {
  console.log('🏠 Home page mounted, checking authentication...')
  
  try {
    // 等待 app.vue 中的會話恢復完成
    await nextTick()
    let waitCount = 0
    while (!window.__SESSION_RESTORE_COMPLETED && waitCount < 20) {
      await new Promise(resolve => setTimeout(resolve, 50))
      waitCount++
    }
    
    console.log('🔄 Home page: App-level session restoration completed, checking auth state...')
    // 不再主動調用 restoreSession，而是檢查 app.vue 恢復的結果
    const sessionRestored = authStore.isAuthenticated && authStore.userId && authStore.isSessionValid
    
    console.log('🏠 Home page session check:', {
      restored: sessionRestored,
      isAuthenticated: authStore.isAuthenticated,
      userId: authStore.userId,
      hasToken: !!authStore.accessToken,
      isSessionValid: authStore.isSessionValid,
      sessionExpiry: authStore.sessionExpiry,
      currentTime: Date.now()
    })
    
    if (sessionRestored && authStore.isAuthenticated && authStore.userId && authStore.isSessionValid) {
      console.log('✅ User authenticated, redirecting to walls list...')
      // 已登入用戶重定向到他們的祝福牆列表
      await router.push(`/${authStore.userId}/walls`)
    } else {
      console.log('❌ User not authenticated, showing welcome screen')
      // 未登入用戶顯示歡迎頁面
      loading.value = false
    }
  } catch (error) {
    console.error('❌ Error during page initialization:', error)
    loading.value = false
  }
})

// 處理登入
const handleLogin = () => {
  router.push('/auth/login')
}

// 設定頁面 meta
useHead({
  title: '婚禮祝福牆 - 留下美好回憶',
  meta: [
    { name: 'description', content: '歡迎來到婚禮祝福牆，上傳照片和留言祝福，與新人分享這個特別的時刻！' }
  ]
})
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.loading-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.welcome-screen {
  min-height: 100vh;
  color: white;
}

/* Hero Section */
.hero-section {
  padding: 80px 20px 60px 20px;
  text-align: center;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
}

.hero-title {
  margin-bottom: 40px;
}

.main-title {
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 20px;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  background: linear-gradient(45deg, #fff, #f0f8ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  font-size: 1.4rem;
  opacity: 0.95;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.hero-actions {
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
}

.primary-btn {
  padding: 15px 30px;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: 50px;
  box-shadow: 0 8px 25px rgba(64, 158, 255, 0.3);
  transition: all 0.3s ease;
}

.primary-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 35px rgba(64, 158, 255, 0.4);
}

/* Features Section */
.features-section {
  padding: 60px 20px;
  background: white;
}

.section-header {
  text-align: center;
  margin-bottom: 50px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.section-header h2 {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 15px;
}

.section-header p {
  font-size: 1.2rem;
  color: #7f8c8d;
  margin: 0;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 30px;
  max-width: 1000px;
  margin: 0 auto;
}

.feature-card {
  background: white;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  transition: all 0.4s ease;
  text-align: center;
  border: 2px solid transparent;
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  border-color: #409EFF;
}

.card-icon {
  margin-bottom: 20px;
  color: #409EFF;
}

.card-content h3 {
  font-size: 1.4rem;
  font-weight: 600;
  margin-bottom: 10px;
  color: #2c3e50;
}

.card-content p {
  color: #7f8c8d;
  margin: 0;
  line-height: 1.6;
}

/* Redirect Message */
.redirect-message {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.redirect-content {
  text-align: center;
}

.redirect-content p {
  font-size: 1.2rem;
  margin-top: 20px;
  opacity: 0.9;
}

/* Responsive Design */
@media (max-width: 768px) {
  .main-title {
    font-size: 2.5rem;
  }
  
  .subtitle {
    font-size: 1.1rem;
  }
  
  .hero-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .primary-btn {
    width: 100%;
    max-width: 300px;
  }
  
  .feature-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .section-header h2 {
    font-size: 2rem;
  }
}

@media (max-width: 480px) {
  .hero-section {
    padding: 60px 15px 40px 15px;
  }
  
  .main-title {
    font-size: 2rem;
  }
  
  .features-section {
    padding: 40px 15px;
  }
  
  .feature-card {
    padding: 25px;
  }
}
</style>