<template>
  <div class="background-upload-container">
    <el-card shadow="hover" class="upload-card">
      <template #header>
        <div class="card-header">
          <el-icon size="24" color="#409EFF">
            <Picture />
          </el-icon>
          <span>祝福牆背景設定</span>
        </div>
      </template>
      
      <div class="upload-content">
        <div class="current-background" v-if="currentBackground">
          <p class="label">目前背景：</p>
          <div class="preview-container">
            <img :src="currentBackground" alt="目前背景" class="background-preview" :key="currentBackground" />
            <div class="preview-overlay">
              <el-button 
                type="danger" 
                size="small" 
                @click="removeBackground"
                :loading="removing"
              >
                移除背景
              </el-button>
            </div>
          </div>
        </div>
        
        <div class="upload-section">
          <div v-if="currentBackground" class="upload-disabled">
            <div class="upload-area disabled">
              <el-icon size="48" color="#C0C4CC">
                <Upload />
              </el-icon>
              <p>已有背景圖片</p>
              <p class="upload-tip warning">請先移除舊背景才能上傳新背景</p>
            </div>
          </div>
          
          <el-upload
            v-else
            class="background-uploader"
            :on-change="onFileChange"
            :on-remove="onFileRemove"
            :auto-upload="false"
            :accept="'image/*'"
            :limit="1"
            :show-file-list="false"
          >
            <div class="upload-area">
              <el-icon size="48" color="#C0C4CC">
                <Upload />
              </el-icon>
              <p>點擊上傳背景圖片</p>
              <p class="upload-tip">建議尺寸: 1920x1080 或更高</p>
            </div>
          </el-upload>
          
          <div v-if="selectedFile" class="file-preview">
            <img :src="previewUrl" alt="預覽" class="preview-image" />
            <div class="file-info">
              <p><strong>{{ selectedFile.name }}</strong></p>
              <p>{{ formatFileSize(selectedFile.size) }}</p>
            </div>
            <div class="upload-actions">
              <el-button 
                type="primary" 
                @click="uploadBackground"
                :loading="uploading"
                :disabled="uploading"
              >
                {{ uploading ? '上傳中...' : '設定為背景' }}
              </el-button>
              <el-button @click="cancelUpload">取消</el-button>
            </div>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { Picture, Upload } from '@element-plus/icons-vue'

const selectedFile = ref<File | null>(null)
const previewUrl = ref('')
const uploading = ref(false)
const removing = ref(false)

const { formatFileSize } = useMinio()
const { getBackgroundUrl, updateBackground, loadBackground } = useBackgroundStore()

// 使用全局背景狀態，並加入強制重新載入機制
const currentBackground = computed(() => {
  const url = getBackgroundUrl()
  // 為圖像 URL 加入強制重新載入參數，避免瀏覽器快取
  if (url && url.trim()) {
    const separator = url.includes('?') ? '&' : '?'
    return `${url}${separator}reload=${Date.now()}`
  }
  return url
})

// 載入當前背景 - 使用全局狀態管理
const loadCurrentBackground = () => loadBackground()

const onFileChange = async (uploadFile: any) => {
  const file = uploadFile.raw
  
  // 檔案類型驗證
  if (!file.type.startsWith('image/')) {
    ElMessage.error('請選擇圖片檔案')
    return
  }
  
  // 檔案大小驗證 (10MB)
  const maxSize = 10 * 1024 * 1024
  if (file.size > maxSize) {
    ElMessage.error('檔案大小不能超過 10MB')
    return
  }
  
  selectedFile.value = file
  
  // 創建預覽
  const reader = new FileReader()
  reader.onload = (e) => {
    previewUrl.value = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

const onFileRemove = () => {
  selectedFile.value = null
  previewUrl.value = ''
}

const cancelUpload = () => {
  onFileRemove()
}

const uploadBackground = async () => {
  if (!selectedFile.value) return
  
  uploading.value = true
  
  try {
    const formData = new FormData()
    formData.append('background', selectedFile.value)
    
    const response = await fetch('/api/wall-background', {
      method: 'POST',
      body: formData
    })
    
    if (response.ok) {
      const data = await response.json()
      console.log('背景上傳成功:', data)
      
      // 更新全局背景狀態
      updateBackground(data.backgroundUrl)
      
      ElMessage.success('背景設定成功！')
      onFileRemove()
      
      // 通知其他頁面背景已更新
      if (window.parent) {
        window.parent.postMessage({ type: 'BACKGROUND_UPDATED' }, '*')
      }
      
      // 確保 UI 狀態同步
      await nextTick()
    } else {
      const errorData = await response.json()
      throw new Error(errorData.statusMessage || '上傳失敗')
    }
  } catch (error) {
    ElMessage.error('上傳失敗，請重試')
    console.error('上傳錯誤:', error)
  } finally {
    uploading.value = false
  }
}

const removeBackground = async () => {
  removing.value = true
  
  try {
    const response = await fetch('/api/wall-background', {
      method: 'DELETE'
    })
    
    if (response.ok) {
      const data = await response.json()
      console.log('背景移除完成:', data)
      
      // 強制清除全局背景狀態
      updateBackground('')
      
      // 強制重新載入背景狀態
      await loadBackground(true)
      
      // 強制清除瀏覽器圖像快取
      const imgElements = document.querySelectorAll('img[src*="wedding-background"]')
      imgElements.forEach(img => {
        const imgEl = img as HTMLImageElement
        const currentSrc = imgEl.src
        imgEl.src = ''
        setTimeout(() => {
          imgEl.src = currentSrc + (currentSrc.includes('?') ? '&' : '?') + 'nocache=' + Date.now()
        }, 10)
      })
      
      ElMessage.success('背景已移除，現在可以上傳新背景了')
      
      // 刷新頁面狀態，確保 UI 更新
      await nextTick()
    } else {
      throw new Error('移除失敗')
    }
  } catch (error) {
    ElMessage.error('移除失敗，請重試')
    console.error('移除錯誤:', error)
  } finally {
    removing.value = false
  }
}

onMounted(() => {
  // 強制從 MinIO 重新載入背景狀態，避免顯示快取的預覽圖
  loadBackground(true)
  
  // 監聽頁面重新整理事件（beforeunload）
  const handleBeforeUnload = () => {
    // 清除所有背景圖像的快取
    const imgElements = document.querySelectorAll('img[src*="wedding-background"], img[src*="background-"]')
    imgElements.forEach(img => {
      const imgEl = img as HTMLImageElement
      imgEl.src = ''
    })
  }
  
  window.addEventListener('beforeunload', handleBeforeUnload)
  
  // 頁面可見性變化時重新載入
  const handleVisibilityChange = () => {
    if (!document.hidden) {
      loadBackground(true)
    }
  }
  
  document.addEventListener('visibilitychange', handleVisibilityChange)
  
  // 清理事件監聽器
  onUnmounted(() => {
    window.removeEventListener('beforeunload', handleBeforeUnload)
    document.removeEventListener('visibilitychange', handleVisibilityChange)
  })
})
</script>

<style scoped>
.background-upload-container {
  margin-bottom: 2rem;
}

.upload-card {
  border-radius: 12px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #2c3e50;
}

.upload-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.current-background .label {
  margin: 0 0 0.5rem 0;
  color: #606266;
  font-weight: 500;
}

.preview-container {
  position: relative;
  display: inline-block;
}

.background-preview {
  width: 200px;
  height: 112px;
  object-fit: cover;
  border-radius: 8px;
  border: 2px solid #e4e7ed;
}

.preview-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.preview-container:hover .preview-overlay {
  opacity: 1;
}

.upload-area {
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  padding: 3rem 2rem;
  text-align: center;
  transition: border-color 0.3s ease;
  cursor: pointer;
}

.upload-area:hover {
  border-color: #409EFF;
}

.upload-area.disabled {
  border-color: #dcdfe6;
  background: #f5f7fa;
  cursor: not-allowed;
}

.upload-area.disabled:hover {
  border-color: #dcdfe6;
}

.upload-area p {
  margin: 0.5rem 0;
  color: #606266;
}

.upload-area.disabled p {
  color: #c0c4cc;
}

.upload-tip {
  font-size: 0.8rem;
  color: #909399;
}

.upload-tip.warning {
  color: #e6a23c;
  font-weight: 500;
}

.file-preview {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background: #f8f9fa;
}

.preview-image {
  width: 80px;
  height: 45px;
  object-fit: cover;
  border-radius: 4px;
}

.file-info {
  flex: 1;
}

.file-info p {
  margin: 0.25rem 0;
  color: #606266;
}

.upload-actions {
  display: flex;
  gap: 0.5rem;
}

@media (max-width: 768px) {
  .file-preview {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .upload-actions {
    width: 100%;
    justify-content: space-between;
  }
  
  .background-preview {
    width: 150px;
    height: 84px;
  }
}
</style>