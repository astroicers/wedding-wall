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

const { formatFileSize } = useMinio()

// 使用 Pinia Stores
const backgroundStore = useBackgroundStore()
const uploadStore = useUploadStore()
const uiStore = useUIStore()

// 使用 Pinia 的背景狀態，自動解決快取問題
const currentBackground = computed(() => {
  const url = backgroundStore.cachedBackgroundUrl
  console.log('當前背景 URL:', url)
  console.log('原始背景 URL:', backgroundStore.backgroundUrl)
  console.log('快取版本:', backgroundStore.cacheVersion)
  return url
})
const uploading = computed(() => uploadStore.isUploading)
const removing = computed(() => backgroundStore.isLoading)

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
  
  try {
    // 使用 Pinia Upload Store 管理上傳狀態
    uploadStore.startUpload('background')
    
    // 使用 Background Store 的上傳方法
    await backgroundStore.uploadBackground(selectedFile.value)
    
    // 記錄成功上傳
    uploadStore.uploadSuccess(selectedFile.value.name)
    
    // 使用 UI Store 顯示成功通知
    await uiStore.showNotification('背景設定成功！', 'success')
    
    // 清除選擇的檔案
    onFileRemove()
    
    // 確保 UI 狀態同步
    await nextTick()
  } catch (error: any) {
    // 記錄失敗上傳
    uploadStore.uploadFailed(error.message || '上傳失敗', selectedFile.value?.name)
    
    // 使用 UI Store 顯示錯誤通知
    await uiStore.showNotification('上傳失敗，請重試', 'error')
    console.error('上傳錯誤:', error)
  }
}

const removeBackground = async () => {
  try {
    // 使用 Background Store 的移除方法，自動處理快取清除
    await backgroundStore.removeBackground()
    
    // 使用 UI Store 顯示成功通知
    await uiStore.showNotification('背景已移除，現在可以上傳新背景了', 'success')
    
    // 確保 UI 狀態同步
    await nextTick()
  } catch (error: any) {
    // 使用 UI Store 顯示錯誤通知
    await uiStore.showNotification('移除失敗，請重試', 'error')
    console.error('移除錯誤:', error)
  }
}

onMounted(() => {
  // 使用 Pinia Background Store 載入背景狀態
  backgroundStore.loadBackground(true)
  
  // 頁面可見性變化時重新載入
  const handleVisibilityChange = () => {
    if (!document.hidden) {
      backgroundStore.loadBackground(true)
    }
  }
  
  document.addEventListener('visibilitychange', handleVisibilityChange)
  
  // 清理事件監聽器
  onUnmounted(() => {
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