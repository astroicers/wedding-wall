<template>
  <div class="home-page">
    <!-- 主標題區域 -->
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
            @click="handleNavigation('/upload')" 
            class="primary-btn"
          >
            <el-icon><Upload /></el-icon>
            立即上傳祝福
          </el-button>
          <el-button 
            size="large" 
            @click="handleNavigation('/wall')" 
            class="secondary-btn"
          >
            <el-icon><Picture /></el-icon>
            觀看祝福牆
          </el-button>
        </div>
      </div>
    </div>

    <!-- 主要功能卡片 -->
    <div class="main-features">
      <div class="section-header">
        <h2>探索功能</h2>
        <p>多種展示方式，讓每一份祝福都閃閃發光</p>
      </div>
      
      <div class="feature-grid">
        <div class="feature-card primary" @click="handleNavigation('/wall')">
          <div class="card-icon">
            <el-icon size="40"><Picture /></el-icon>
          </div>
          <div class="card-content">
            <h3>經典祝福牆</h3>
            <p>傳統輪播模式，穩重典雅</p>
          </div>
          <div class="card-arrow">
            <el-icon><ArrowRight /></el-icon>
          </div>
        </div>

        <div class="feature-card featured" @click="handleNavigation('/wall-styles')">
          <div class="card-badge">HOT</div>
          <div class="card-icon">
            <el-icon size="40"><MagicStick /></el-icon>
          </div>
          <div class="card-content">
            <h3>風格祝福牆</h3>
            <p>多種精美風格，視覺享受</p>
          </div>
          <div class="card-arrow">
            <el-icon><ArrowRight /></el-icon>
          </div>
        </div>

        <div class="feature-card" @click="handleNavigation('/gallery')">
          <div class="card-icon">
            <el-icon size="40"><PhotoIcon /></el-icon>
          </div>
          <div class="card-content">
            <h3>相簿展示</h3>
            <p>瀏覽所有珍貴回憶</p>
          </div>
          <div class="card-arrow">
            <el-icon><ArrowRight /></el-icon>
          </div>
        </div>

        <div class="feature-card admin" @click="handleNavigation('/admin')">
          <div class="card-badge admin-badge">ADMIN</div>
          <div class="card-icon">
            <el-icon size="40"><Tools /></el-icon>
          </div>
          <div class="card-content">
            <h3>管理控制台</h3>
            <p>留言審核與系統設定</p>
          </div>
          <div class="card-arrow">
            <el-icon><ArrowRight /></el-icon>
          </div>
        </div>
      </div>
    </div>

    <!-- 風格預覽 -->
    <div class="style-showcase">
      <div class="section-header">
        <h2>風格預覽</h2>
        <p>選擇您喜歡的展示風格</p>
      </div>
      
      <div class="style-grid">
        <div class="style-card" @click="handleNavigation('/wall-enhanced')">
          <div class="style-preview instagram">
            <div class="preview-content">
              <el-icon size="30"><Star /></el-icon>
              <span>Instagram 風格</span>
            </div>
          </div>
          <div class="style-info">
            <h4>Instagram 風格</h4>
            <p>社群媒體風格展示</p>
          </div>
        </div>

        <div class="style-card" @click="handleNavigation('/wall-stories')">
          <div class="style-preview stories">
            <div class="preview-content">
              <el-icon size="30"><VideoCamera /></el-icon>
              <span>Stories 風格</span>
            </div>
          </div>
          <div class="style-info">
            <h4>Stories 風格</h4>
            <p>動態故事般的體驗</p>
          </div>
        </div>

        <div class="style-card" @click="handleNavigation('/wall-magazine')">
          <div class="style-preview magazine">
            <div class="preview-content">
              <el-icon size="30"><Document /></el-icon>
              <span>Magazine 風格</span>
            </div>
          </div>
          <div class="style-info">
            <h4>Magazine 風格</h4>
            <p>雜誌排版的精緻感</p>
          </div>
        </div>

        <div class="style-card" @click="handleNavigation('/wall-polaroid')">
          <div class="style-preview polaroid">
            <div class="preview-content">
              <el-icon size="30"><Picture /></el-icon>
              <span>Polaroid 風格</span>
            </div>
          </div>
          <div class="style-info">
            <h4>Polaroid 風格</h4>
            <p>復古拍立得質感</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 使用指南 -->
    <div class="guide-section">
      <div class="section-header">
        <h2>使用指南</h2>
        <p>三步驟輕鬆留下美好祝福</p>
      </div>
      
      <div class="guide-steps">
        <div class="step-item">
          <div class="step-number">1</div>
          <div class="step-content">
            <h4>上傳照片</h4>
            <p>選擇一張美好的照片</p>
          </div>
        </div>
        <div class="step-divider">
          <el-icon><ArrowRight /></el-icon>
        </div>
        <div class="step-item">
          <div class="step-number">2</div>
          <div class="step-content">
            <h4>填寫祝福</h4>
            <p>留下真誠的祝福文字</p>
          </div>
        </div>
        <div class="step-divider">
          <el-icon><ArrowRight /></el-icon>
        </div>
        <div class="step-item">
          <div class="step-number">3</div>
          <div class="step-content">
            <h4>即時展示</h4>
            <p>在祝福牆上看到您的祝福</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { 
  Picture, 
  Upload, 
  Star, 
  MagicStick, 
  VideoCamera, 
  Document, 
  Tools,
  ArrowRight
} from '@element-plus/icons-vue'

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

// 導航處理函數
const handleNavigation = (path: string) => {
  navigateTo(path)
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
  console.log('首頁已載入')
})
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* Hero 區域 */
.hero-section {
  padding: 80px 20px 60px 20px;
  text-align: center;
  color: white;
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

.secondary-btn {
  padding: 15px 30px;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: 50px;
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: white;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.secondary-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(255, 255, 255, 0.2);
}

/* 主要功能區域 */
.main-features {
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
  max-width: 1200px;
  margin: 0 auto;
}

.feature-card {
  background: white;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.4s ease;
  position: relative;
  overflow: hidden;
  border: 2px solid transparent;
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.feature-card.primary {
  border-color: #409EFF;
}

.feature-card.primary:hover {
  background: linear-gradient(135deg, #409EFF, #66b3ff);
  color: white;
}

.feature-card.featured {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.feature-card.admin {
  border-color: #667eea;
}

.feature-card.admin:hover {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.card-badge {
  position: absolute;
  top: 15px;
  right: 15px;
  background: rgba(255, 255, 255, 0.9);
  color: #f5576c;
  padding: 5px 12px;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 600;
}

.admin-badge {
  background: rgba(255, 255, 255, 0.9);
  color: #667eea;
}

.card-icon {
  margin-bottom: 20px;
  color: #409EFF;
}

.feature-card.featured .card-icon {
  color: white;
}

.feature-card:hover .card-icon {
  color: white;
  transform: scale(1.1);
}

.card-content h3 {
  font-size: 1.4rem;
  font-weight: 600;
  margin-bottom: 10px;
  color: inherit;
}

.card-content p {
  color: #7f8c8d;
  margin: 0;
  line-height: 1.6;
}

.feature-card:hover .card-content p {
  color: rgba(255, 255, 255, 0.9);
}

.card-arrow {
  position: absolute;
  bottom: 20px;
  right: 20px;
  opacity: 0;
  transform: translateX(-10px);
  transition: all 0.3s ease;
  color: #409EFF;
}

.feature-card:hover .card-arrow {
  opacity: 1;
  transform: translateX(0);
  color: white;
}

/* 風格預覽區域 */
.style-showcase {
  padding: 60px 20px;
  background: #f8f9fa;
}

.style-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 25px;
  max-width: 1000px;
  margin: 0 auto;
}

.style-card {
  background: white;
  border-radius: 15px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.style-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.style-preview {
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  color: white;
}

.style-preview.instagram {
  background: linear-gradient(45deg, #f093fb, #f5576c);
}

.style-preview.stories {
  background: linear-gradient(45deg, #667eea, #764ba2);
}

.style-preview.magazine {
  background: linear-gradient(45deg, #4facfe, #00f2fe);
}

.style-preview.polaroid {
  background: linear-gradient(45deg, #43e97b, #38f9d7);
}

.preview-content {
  text-align: center;
}

.preview-content span {
  display: block;
  margin-top: 10px;
  font-weight: 600;
}

.style-info {
  padding: 20px;
}

.style-info h4 {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: #2c3e50;
}

.style-info p {
  color: #7f8c8d;
  margin: 0;
  font-size: 0.9rem;
}

/* 使用指南 */
.guide-section {
  padding: 60px 20px;
  background: white;
}

.guide-steps {
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 800px;
  margin: 0 auto;
  flex-wrap: wrap;
  gap: 20px;
}

.step-item {
  text-align: center;
  flex: 1;
  min-width: 200px;
}

.step-number {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 1.5rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px auto;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.step-content h4 {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: #2c3e50;
}

.step-content p {
  color: #7f8c8d;
  margin: 0;
}

.step-divider {
  color: #667eea;
  font-size: 1.5rem;
  margin: 0 20px;
}

/* 響應式設計 */
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
  
  .primary-btn,
  .secondary-btn {
    width: 100%;
    max-width: 300px;
  }
  
  .feature-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .style-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }
  
  .guide-steps {
    flex-direction: column;
  }
  
  .step-divider {
    transform: rotate(90deg);
    margin: 10px 0;
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
  
  .main-features,
  .style-showcase,
  .guide-section {
    padding: 40px 15px;
  }
  
  .feature-card {
    padding: 25px;
  }
}
</style>