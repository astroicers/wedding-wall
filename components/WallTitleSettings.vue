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
            
            <el-form-item label="字體類型">
              <el-select 
                v-model="fontFamily" 
                placeholder="選擇字體"
                @change="handleFontChange"
              >
                <el-option-group label="系統字體">
                  <el-option label="默認字體" value="system-ui, -apple-system, sans-serif" />
                  <el-option label="微軟正黑體" value="Microsoft JhengHei, sans-serif" />
                  <el-option label="標楷體" value="DFKai-SB, serif" />
                  <el-option label="新細明體" value="PMingLiU, serif" />
                  <el-option label="Arial" value="Arial, sans-serif" />
                  <el-option label="Times New Roman" value="Times New Roman, serif" />
                  <el-option label="Georgia" value="Georgia, serif" />
                </el-option-group>
                <el-option-group label="Google Fonts - 中文字體">
                  <el-option label="思源黑體" value="Noto Sans TC" />
                  <el-option label="思源宋體" value="Noto Serif TC" />
                  <el-option label="中文楷體" value="cwTeXKai" />
                  <el-option label="中文圓體" value="cwTeXYen" />
                  <el-option label="中文仿宋體" value="cwTeXFangSong" />
                </el-option-group>
                <el-option-group v-if="customFonts.length > 0" label="自定義字體">
                  <el-option 
                    v-for="font in customFonts" 
                    :key="font.name"
                    :label="font.displayName" 
                    :value="font.name" 
                  />
                </el-option-group>
              </el-select>
            </el-form-item>
            
            <el-form-item label="字體大小">
              <el-select 
                v-model="fontSize" 
                placeholder="選擇字體大小"
                @change="updateTitle"
              >
                <el-option :label="`${size}px`" :value="size" v-for="size in fontSizeOptions" :key="size" />
              </el-select>
              <div style="margin-top: 5px; font-size: 12px; color: #909399;">
                副標題字體大小會自動調整為主標題的 50%
              </div>
            </el-form-item>
          </el-form>
          
          <div class="preview-section">
            <div class="preview-label">預覽效果</div>
            <div class="preview-box">
              <h2 :style="{ 
                color: titleColor, 
                fontFamily: getFontFamilyWithFallback(fontFamily),
                fontSize: fontSize + 'px'
              }">{{ wallTitle || '祝福牆' }}</h2>
              <p v-if="wallSubtitle" :style="{ 
                color: titleColor, 
                opacity: 0.8,
                fontFamily: getFontFamilyWithFallback(fontFamily),
                fontSize: (fontSize * 0.5) + 'px'
              }">{{ wallSubtitle }}</p>
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
import { useGoogleFonts } from '~/composables/useGoogleFonts'

// 設定項目
const wallTitle = ref('祝福牆')
const wallSubtitle = ref('')
const titleColor = ref('#2c3e50')
const fontFamily = ref('system-ui, -apple-system, sans-serif')
const fontSize = ref(48)

// 字體大小選項
const fontSizeOptions = [20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64, 72]

// 從 localStorage 載入設定
onMounted(async () => {
  await loadCustomFontsList()
  // 確保字體列表載入完成後再載入設定和字體
  await nextTick()
  await loadSettings()
})

const loadSettings = async () => {
  try {
    const settings = localStorage.getItem('wallTitleSettings')
    if (settings) {
      const parsed = JSON.parse(settings)
      wallTitle.value = parsed.wallTitle || '祝福牆'
      wallSubtitle.value = parsed.wallSubtitle || ''
      titleColor.value = parsed.titleColor || '#2c3e50'
      fontFamily.value = parsed.fontFamily || 'system-ui, -apple-system, sans-serif'
      fontSize.value = parsed.fontSize || 48
      
      // 載入字體（如果需要）
      await loadFont(fontFamily.value)
    }
  } catch (error) {
    console.error('載入標題設定失敗:', error)
  }
}

const updateTitle = () => {
  const settings = {
    wallTitle: wallTitle.value,
    wallSubtitle: wallSubtitle.value,
    titleColor: titleColor.value,
    fontFamily: fontFamily.value,
    fontSize: fontSize.value
  }
  
  try {
    localStorage.setItem('wallTitleSettings', JSON.stringify(settings))
    // 發送事件通知其他組件設定已更新
    window.dispatchEvent(new CustomEvent('wallTitleUpdated', { detail: settings }))
  } catch (error) {
    console.error('保存標題設定失敗:', error)
  }
}

// 使用 Google Fonts 工具
const { isGoogleFont, getFontFamilyWithFallback, loadFont, customFonts, loadCustomFontsList } = useGoogleFonts()

// 處理字體變更
const handleFontChange = async (value: string) => {
  fontFamily.value = value
  await loadFont(value)
  updateTitle()
}

const resetToDefault = () => {
  wallTitle.value = '祝福牆'
  wallSubtitle.value = ''
  titleColor.value = '#2c3e50'
  fontFamily.value = 'system-ui, -apple-system, sans-serif'
  fontSize.value = 48
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