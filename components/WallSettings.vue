<template>
  <div class="wall-settings-container">
    <div class="el-card is-hover-shadow settings-card">
      <div class="el-card__header">
        <div class="card-header">
          <el-icon size="24" color="#409EFF">
            <Setting />
          </el-icon>
          <span>祝福牆顯示設定</span>
        </div>
      </div>
      <div class="el-card__body">
        <div class="settings-content">
          <div class="setting-group">
            <label class="setting-label">自動播放間隔時間</label>
            <div class="setting-control">
              <el-slider 
                v-model="autoplayDelay" 
                :min="2" 
                :max="10" 
                :step="1"
                show-stops
                @change="updateSettings"
              />
              <span class="setting-value">{{ autoplayDelay }} 秒</span>
            </div>
          </div>

          <div class="setting-group">
            <label class="setting-label">長文字額外時間</label>
            <div class="setting-control">
              <el-slider 
                v-model="longTextDelay" 
                :min="1" 
                :max="5" 
                :step="0.5"
                show-stops
                @change="updateSettings"
              />
              <span class="setting-value">+{{ longTextDelay }} 秒</span>
            </div>
          </div>

          <div class="setting-group">
            <label class="setting-label">圖片額外時間</label>
            <div class="setting-control">
              <el-slider 
                v-model="imageDelay" 
                :min="0.5" 
                :max="3" 
                :step="0.5"
                show-stops
                @change="updateSettings"
              />
              <span class="setting-value">+{{ imageDelay }} 秒</span>
            </div>
          </div>

          <div class="setting-group">
            <label class="setting-label">最大顯示時間</label>
            <div class="setting-control">
              <el-slider 
                v-model="maxDelay" 
                :min="5" 
                :max="15" 
                :step="1"
                show-stops
                @change="updateSettings"
              />
              <span class="setting-value">{{ maxDelay }} 秒</span>
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
import { Setting, RefreshRight } from '@element-plus/icons-vue'

// 設定項目
const autoplayDelay = ref(3)      // 基礎間隔時間（秒）
const longTextDelay = ref(2)      // 長文字額外時間（秒）
const imageDelay = ref(1)         // 圖片額外時間（秒）
const maxDelay = ref(8)          // 最大顯示時間（秒）

// 從 localStorage 載入設定
onMounted(() => {
  loadSettings()
})

const loadSettings = () => {
  try {
    const settings = localStorage.getItem('wallSettings')
    if (settings) {
      const parsed = JSON.parse(settings)
      autoplayDelay.value = parsed.autoplayDelay || 3
      longTextDelay.value = parsed.longTextDelay || 2
      imageDelay.value = parsed.imageDelay || 1
      maxDelay.value = parsed.maxDelay || 8
    }
  } catch (error) {
    console.error('載入設定失敗:', error)
  }
}

const updateSettings = () => {
  const settings = {
    autoplayDelay: autoplayDelay.value,
    longTextDelay: longTextDelay.value,
    imageDelay: imageDelay.value,
    maxDelay: maxDelay.value
  }
  
  try {
    localStorage.setItem('wallSettings', JSON.stringify(settings))
    // 發送事件通知其他組件設定已更新
    window.dispatchEvent(new CustomEvent('wallSettingsUpdated', { detail: settings }))
  } catch (error) {
    console.error('保存設定失敗:', error)
  }
}

const resetToDefault = () => {
  autoplayDelay.value = 3
  longTextDelay.value = 2
  imageDelay.value = 1
  maxDelay.value = 8
  updateSettings()
  ElMessage.success('已重置為默認設定')
}

// 導出設定供其他組件使用
defineExpose({
  autoplayDelay,
  longTextDelay,
  imageDelay,
  maxDelay
})
</script>

<style scoped>
.wall-settings-container {
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

.setting-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.setting-label {
  font-weight: 500;
  color: #2c3e50;
  font-size: 0.95rem;
}

.setting-control {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.setting-control .el-slider {
  flex: 1;
}

.setting-value {
  min-width: 50px;
  text-align: center;
  font-weight: 500;
  color: #409EFF;
  font-size: 0.9rem;
}

.setting-actions {
  padding-top: 1rem;
  border-top: 1px solid #ebeef5;
  display: flex;
  justify-content: center;
}

@media (max-width: 768px) {
  .setting-control {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }
  
  .setting-value {
    text-align: left;
  }
}
</style>