<template>
  <div class="wall-style-selector">
    <div class="selector-header">
      <h2>選擇祝福牆風格</h2>
      <p>體驗不同的祝福牆風格，每種都是全螢幕沉浸式體驗</p>
    </div>
    
    <div class="styles-grid">
      <div 
        v-for="style in wallStyles" 
        :key="style.id"
        class="style-card"
        :class="{ 'featured': style.featured }"
        @click="navigateToStyle(style.route)"
      >
        <div class="style-preview">
          <div class="preview-background" :style="style.previewStyle">
            <div class="preview-content">
              <component :is="style.iconComponent" class="style-icon" />
              <div class="preview-text">{{ style.previewText }}</div>
            </div>
          </div>
        </div>
        
        <div class="style-info">
          <h3 class="style-name">{{ style.name }}</h3>
          <p class="style-description">{{ style.description }}</p>
          
          <div class="style-features">
            <span 
              v-for="feature in style.features" 
              :key="feature"
              class="feature-tag"
            >
              {{ feature }}
            </span>
          </div>
          
          <div class="style-actions">
            <el-button 
              type="primary" 
              @click.stop="navigateToStyle(style.route)"
              :loading="loading"
            >
              體驗風格
            </el-button>
            
            <el-button 
              v-if="style.featured"
              type="success" 
              size="small"
              disabled
            >
              推薦
            </el-button>
          </div>
        </div>
      </div>
    </div>
    
    <div class="selector-footer">
      <el-divider>
        <span class="divider-text">快捷鍵說明</span>
      </el-divider>
      
      <div class="keyboard-shortcuts">
        <div class="shortcut-item">
          <kbd>空白鍵</kbd>
          <span>暫停/播放</span>
        </div>
        <div class="shortcut-item">
          <kbd>←/→</kbd>
          <span>切換祝福</span>
        </div>
        <div class="shortcut-item">
          <kbd>I</kbd>
          <span>顯示/隱藏資訊</span>
        </div>
        <div class="shortcut-item">
          <kbd>C</kbd>
          <span>顯示/隱藏控制</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const loading = ref(false)

// 創建自定義圖標組件
const StoriesIcon = {
  render() {
    return h('div', { class: 'custom-icon stories-icon' }, [
      h('div', { class: 'icon-element' }),
      h('div', { class: 'icon-element' }),
      h('div', { class: 'icon-element' })
    ])
  }
}

const MagazineIcon = {
  render() {
    return h('div', { class: 'custom-icon magazine-icon' }, [
      h('div', { class: 'magazine-cover' }),
      h('div', { class: 'magazine-text' })
    ])
  }
}

const PolaroidIcon = {
  render() {
    return h('div', { class: 'custom-icon polaroid-icon' }, [
      h('div', { class: 'polaroid-frame' }),
      h('div', { class: 'polaroid-image' })
    ])
  }
}


const wallStyles = [
  {
    id: 'instagram',
    name: 'Instagram 風格',
    description: '社交媒體風格的貼文展示，支援互動效果',
    route: '/wall-enhanced',
    featured: true,
    iconComponent: 'el-icon',
    previewText: '❤️ 點讚互動',
    previewStyle: {
      background: 'linear-gradient(45deg, #833ab4, #fd1d1d, #fcb045)'
    },
    features: ['互動效果', '動態轉場', '多重特效']
  },
  {
    id: 'stories',
    name: 'Stories 風格',
    description: '垂直全螢幕體驗，類似 Instagram Stories',
    route: '/wall-stories',
    featured: false,
    iconComponent: StoriesIcon,
    previewText: '📱 全螢幕',
    previewStyle: {
      background: 'linear-gradient(180deg, #667eea, #764ba2)'
    },
    features: ['垂直滑動', '進度條', '觸控友善']
  },
  {
    id: 'magazine',
    name: 'Magazine 風格',
    description: '優雅的雜誌排版設計，專業印刷風格',
    route: '/wall-magazine',
    featured: false,
    iconComponent: MagazineIcon,
    previewText: '📖 雜誌風',
    previewStyle: {
      background: 'linear-gradient(135deg, #f5f7fa, #c3cfe2)'
    },
    features: ['優雅排版', '襯線字體', '專業設計']
  },
  {
    id: 'polaroid',
    name: 'Polaroid 風格',
    description: '復古拍立得照片效果，懷舊溫馨感',
    route: '/wall-polaroid',
    featured: true,
    iconComponent: PolaroidIcon,
    previewText: '📷 復古風',
    previewStyle: {
      background: 'linear-gradient(135deg, #f093fb, #f5576c)'
    },
    features: ['復古效果', '手寫字體', '溫馨氛圍']
  },
]

const navigateToStyle = async (route: string) => {
  loading.value = true
  try {
    await navigateTo(route)
  } finally {
    setTimeout(() => {
      loading.value = false
    }, 1000)
  }
}
</script>

<style scoped>
.wall-style-selector {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.selector-header {
  text-align: center;
  margin-bottom: 3rem;
}

.selector-header h2 {
  font-size: 2.2rem;
  color: #2c3e50;
  margin-bottom: 1rem;
  font-weight: bold;
}

.selector-header p {
  font-size: 1.1rem;
  color: #7f8c8d;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

.styles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.style-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
  border: 2px solid transparent;
}

.style-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
  border-color: #409EFF;
}

.style-card.featured {
  border-color: #67C23A;
  position: relative;
}

.style-card.featured::before {
  content: '推薦';
  position: absolute;
  top: 12px;
  right: 12px;
  background: #67C23A;
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
  z-index: 2;
}

.style-preview {
  height: 200px;
  position: relative;
  overflow: hidden;
}

.preview-background {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.preview-content {
  text-align: center;
  color: white;
  z-index: 2;
}

.style-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.9;
}

.preview-text {
  font-size: 1.2rem;
  font-weight: 600;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.style-info {
  padding: 1.5rem;
}

.style-name {
  font-size: 1.4rem;
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
  font-weight: 600;
}

.style-description {
  color: #7f8c8d;
  line-height: 1.5;
  margin-bottom: 1rem;
  font-size: 0.95rem;
}

.style-features {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.feature-tag {
  background: #f8f9fa;
  color: #5a6c7d;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 500;
}

.style-actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.selector-footer {
  margin-top: 3rem;
}

.divider-text {
  color: #409EFF;
  font-weight: 500;
}

.keyboard-shortcuts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1.5rem;
}

.shortcut-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.shortcut-item kbd {
  background: #e9ecef;
  border: 1px solid #ced4da;
  border-radius: 4px;
  padding: 0.25rem 0.5rem;
  font-size: 0.85rem;
  font-family: monospace;
  color: #495057;
}

.shortcut-item span {
  color: #6c757d;
  font-size: 0.9rem;
}

/* 自定義圖標樣式 */
.custom-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 1rem;
  position: relative;
}

.stories-icon {
  display: flex;
  flex-direction: column;
  gap: 4px;
  justify-content: center;
}

.stories-icon .icon-element {
  height: 12px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 6px;
}

.magazine-icon .magazine-cover {
  width: 100%;
  height: 35px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 4px;
  margin-bottom: 8px;
}

.magazine-icon .magazine-text {
  width: 80%;
  height: 4px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 2px;
}

.polaroid-icon .polaroid-frame {
  width: 40px;
  height: 32px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 4px;
  margin: 0 auto 8px;
  position: relative;
}

.polaroid-icon .polaroid-image {
  width: 32px;
  height: 20px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 2px;
  margin: 4px auto;
}


/* 響應式設計 */
@media (max-width: 768px) {
  .wall-style-selector {
    padding: 1rem;
  }
  
  .styles-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .selector-header h2 {
    font-size: 1.8rem;
  }
  
  .keyboard-shortcuts {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .style-preview {
    height: 150px;
  }
  
  .style-info {
    padding: 1rem;
  }
  
  .style-actions {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>