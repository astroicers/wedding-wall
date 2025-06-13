<template>
  <div class="wall-title-settings-container">
    <div class="el-card is-hover-shadow settings-card">
      <div class="el-card__header">
        <div class="card-header">
          <el-icon size="24" color="#409EFF">
            <Edit />
          </el-icon>
          <span>祝福牆標題設定</span>
        </div>
      </div>
      <div class="el-card__body">
        <div class="settings-content">
          <el-form label-position="top">
            <el-form-item label="祝福牆標題">
              <el-input 
                v-model="wallTitle" 
                placeholder="輸入祝福牆標題"
                maxlength="30"
                show-word-limit
                @change="updateTitle"
              />
            </el-form-item>
            
            <el-form-item label="副標題">
              <el-input 
                v-model="wallSubtitle" 
                placeholder="輸入副標題（選填）"
                maxlength="50"
                show-word-limit
                @change="updateTitle"
              />
            </el-form-item>
            
            <el-form-item label="標題顏色">
              <el-color-picker 
                v-model="titleColor"
                @change="updateTitle"
              />
            </el-form-item>
          </el-form>
          
          <div class="preview-section">
            <div class="preview-label">預覽效果</div>
            <div class="preview-box">
              <h2 :style="{ color: titleColor }">{{ wallTitle || '婚禮祝福牆' }}</h2>
              <p v-if="wallSubtitle" :style="{ color: titleColor, opacity: 0.8 }">{{ wallSubtitle }}</p>
            </div>
          </div>
          
          <div class="setting-actions">
            <el-button @click="resetToDefault" size="small">
              <el-icon><RefreshRight /></el-icon>
              重置為默認值
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Edit, RefreshRight } from '@element-plus/icons-vue'

// 設定項目
const wallTitle = ref('婚禮祝福牆')
const wallSubtitle = ref('')
const titleColor = ref('#2c3e50')

// 從 localStorage 載入設定
onMounted(() => {
  loadSettings()
})

const loadSettings = () => {
  try {
    const settings = localStorage.getItem('wallTitleSettings')
    if (settings) {
      const parsed = JSON.parse(settings)
      wallTitle.value = parsed.wallTitle || '婚禮祝福牆'
      wallSubtitle.value = parsed.wallSubtitle || ''
      titleColor.value = parsed.titleColor || '#2c3e50'
    }
  } catch (error) {
    console.error('載入標題設定失敗:', error)
  }
}

const updateTitle = () => {
  const settings = {
    wallTitle: wallTitle.value,
    wallSubtitle: wallSubtitle.value,
    titleColor: titleColor.value
  }
  
  try {
    localStorage.setItem('wallTitleSettings', JSON.stringify(settings))
    // 發送事件通知其他組件設定已更新
    window.dispatchEvent(new CustomEvent('wallTitleUpdated', { detail: settings }))
  } catch (error) {
    console.error('保存標題設定失敗:', error)
  }
}

const resetToDefault = () => {
  wallTitle.value = '婚禮祝福牆'
  wallSubtitle.value = ''
  titleColor.value = '#2c3e50'
  updateTitle()
  ElMessage.success('已重置為默認標題')
}
</script>

<style scoped>
.wall-title-settings-container {
  margin-bottom: 2rem;
}

.settings-card {
  border-radius: 12px;
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.settings-card:hover {
  border-color: #409EFF;
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #2c3e50;
  font-weight: 600;
  font-size: 1.1rem;
}

.settings-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.preview-section {
  padding: 1rem;
  background: #f5f7fa;
  border-radius: 8px;
}

.preview-label {
  font-weight: 500;
  color: #606266;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.preview-box {
  text-align: center;
  padding: 1rem;
  background: white;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.preview-box h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.8rem;
  font-weight: bold;
}

.preview-box p {
  margin: 0;
  font-size: 1rem;
}

.setting-actions {
  padding-top: 1rem;
  border-top: 1px solid #ebeef5;
  display: flex;
  justify-content: center;
}

@media (max-width: 768px) {
  .preview-box h2 {
    font-size: 1.5rem;
  }
  
  .preview-box p {
    font-size: 0.9rem;
  }
}
</style>