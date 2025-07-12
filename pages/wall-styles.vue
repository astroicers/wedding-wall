<template>
  <div class="wall-styles-page">
    <!-- 頁面標題區域 -->
    <div class="page-header">
      <div class="back-button" @click="navigateTo('/')">
        <el-icon size="20">
          <ArrowLeft />
        </el-icon>
        <span>返回首頁</span>
      </div>
      
      <div class="header-content">
        <h1 class="page-title">🎨 祝福牆風格館</h1>
        <p class="page-subtitle">探索多種精美的祝福牆風格，每一種都帶來不同的視覺體驗</p>
      </div>
    </div>
    
    <!-- 風格選擇器 -->
    <div class="styles-content">
      <WallStyleSelector />
    </div>
    
    <!-- 功能介紹 -->
    <div class="features-section">
      <el-divider>
        <span class="divider-text">特色功能</span>
      </el-divider>
      
      <el-row :gutter="20">
        <el-col :span="8">
          <div class="feature-item">
            <el-icon size="32" color="#409EFF">
              <FullScreen />
            </el-icon>
            <h4>全螢幕體驗</h4>
            <span>所有風格都支援全螢幕沉浸式體驗</span>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="feature-item">
            <el-icon size="32" color="#67C23A">
              <MagicStick />
            </el-icon>
            <h4>多重特效</h4>
            <span>豐富的轉場動畫和視覺效果</span>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="feature-item">
            <el-icon size="32" color="#E6A23C">
              <Monitor />
            </el-icon>
            <h4>響應式設計</h4>
            <span>完美適配各種裝置和螢幕尺寸</span>
          </div>
        </el-col>
      </el-row>
    </div>
    
    <!-- 使用說明 -->
    <div class="usage-section">
      <el-divider>
        <span class="divider-text">使用說明</span>
      </el-divider>
      
      <div class="usage-content">
        <div class="usage-item">
          <div class="step-number">1</div>
          <div class="step-content">
            <h4>選擇風格</h4>
            <p>點擊上方任一風格卡片即可進入該風格的祝福牆</p>
          </div>
        </div>
        
        <div class="usage-item">
          <div class="step-number">2</div>
          <div class="step-content">
            <h4>全螢幕體驗</h4>
            <p>進入祝福牆後會自動隱藏導航欄，提供沉浸式體驗</p>
          </div>
        </div>
        
        <div class="usage-item">
          <div class="step-number">3</div>
          <div class="step-content">
            <h4>互動控制</h4>
            <p>使用滑鼠懸停或鍵盤快捷鍵來控制播放和切換</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- QR Code 上傳按鈕 -->
    <QRCodeUpload />
  </div>
</template>

<script setup lang="ts">
import WallStyleSelector from '~/components/WallStyleSelector.vue'
import QRCodeUpload from '~/components/QRCodeUpload.vue'
import { 
  ArrowLeft, 
  FullScreen, 
  MagicStick, 
  Monitor 
} from '@element-plus/icons-vue'

// 使用 Pinia Stores
const uiStore = useUIStore()

// 設定頁面 meta
useHead({
  title: '祝福牆風格館 - 祝福牆',
  meta: [
    { name: 'description', content: '探索多種精美的祝福牆風格，包含 Instagram、Stories、Magazine、Polaroid、Timeline、Mosaic 等風格' }
  ]
})

// 初始化頁面
onMounted(() => {
  // 設定當前頁面
  uiStore.setCurrentPage('wall-styles')
})
</script>

<style scoped>
.wall-styles-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.page-header {
  position: relative;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem 1rem 3rem;
  text-align: center;
}

.back-button {
  position: absolute;
  top: 20px;
  left: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border-radius: 25px;
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.back-button:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
}

.header-content {
  max-width: 800px;
  margin: 0 auto;
  padding-top: 2rem;
}

.page-title {
  font-size: 3rem;
  font-weight: bold;
  margin: 0 0 1rem 0;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.page-subtitle {
  font-size: 1.3rem;
  opacity: 0.9;
  margin: 0;
  line-height: 1.6;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.styles-content {
  background: white;
  margin: -2rem 0 0 0;
  border-radius: 20px 20px 0 0;
  box-shadow: 0 -10px 30px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 2;
}

.features-section {
  background: white;
  padding: 3rem 2rem;
}

.divider-text {
  color: #409EFF;
  font-weight: 500;
  font-size: 1.1rem;
}

.feature-item {
  text-align: center;
  padding: 2rem 1rem;
  background: #f8f9fa;
  border-radius: 12px;
  transition: all 0.3s ease;
  height: 100%;
}

.feature-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.feature-item h4 {
  margin: 1rem 0 0.5rem 0;
  color: #2c3e50;
  font-size: 1.2rem;
  font-weight: 600;
}

.feature-item span {
  color: #7f8c8d;
  font-size: 0.95rem;
  line-height: 1.5;
}

.usage-section {
  background: #f8f9fa;
  padding: 3rem 2rem;
}

.usage-content {
  max-width: 800px;
  margin: 0 auto;
}

.usage-item {
  display: flex;
  align-items: flex-start;
  gap: 2rem;
  margin-bottom: 2.5rem;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
}

.step-number {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
  flex-shrink: 0;
}

.step-content h4 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
  font-size: 1.3rem;
  font-weight: 600;
}

.step-content p {
  margin: 0;
  color: #7f8c8d;
  line-height: 1.6;
  font-size: 1rem;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .page-header {
    padding: 1.5rem 1rem 2rem;
  }
  
  .back-button {
    top: 15px;
    left: 15px;
    padding: 10px 16px;
  }
  
  .header-content {
    padding-top: 1rem;
  }
  
  .page-title {
    font-size: 2.2rem;
  }
  
  .page-subtitle {
    font-size: 1.1rem;
  }
  
  .features-section,
  .usage-section {
    padding: 2rem 1rem;
  }
  
  .usage-item {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
  
  .step-number {
    margin: 0 auto;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.8rem;
  }
  
  .page-subtitle {
    font-size: 1rem;
  }
  
  .feature-item {
    padding: 1.5rem 0.75rem;
  }
  
  .usage-item {
    padding: 1.5rem;
  }
}
</style>