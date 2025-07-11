<template>
    <el-form @submit.prevent>
      <el-form-item label="您的姓名">
        <el-input 
          v-model="name" 
          placeholder="請輸入您的姓名" 
          :disabled="uploading"
        />
      </el-form-item>
      <el-form-item label="祝福的話">
        <el-input 
          v-model="text" 
          placeholder="請輸入祝福內容（最多50字）" 
          type="textarea" 
          :rows="3"
          maxlength="50"
          show-word-limit
          :disabled="uploading"
        />
      </el-form-item>
      <el-form-item label="上傳圖片（可選）">
        <div class="upload-mode-selector">
          <el-radio-group v-model="uploadMode" @change="onModeChange">
            <el-radio label="image">圖片模式</el-radio>
            <el-radio label="text">純文字模式</el-radio>
          </el-radio-group>
        </div>
        
        <div v-if="uploadMode === 'image'" class="image-upload-section">
          <el-upload
            class="upload-demo"
            :on-change="onFileChange"
            :on-remove="onFileRemove"
            :auto-upload="false"
            :accept="'image/*'"
            :limit="1"
          >
            <el-button>選擇圖片</el-button>
            <template #tip>
              <div class="el-upload__tip">
                支援 JPG/PNG/GIF/WebP 格式，檔案大小不超過 5MB
              </div>
            </template>
          </el-upload>
        </div>
        
        <div v-else class="text-mode-tip">
          <el-alert
            title="純文字模式"
            type="info"
            :closable="false"
            show-icon
          >
            <template #default>
              您選擇了純文字模式，祝福訊息將以文字形式展示，無需上傳圖片。
            </template>
          </el-alert>
        </div>
        
        <div v-if="previewUrl" class="image-preview">
          <img :src="previewUrl" alt="預覽圖片" />
          <div class="preview-info">
            <p>檔案名稱: {{ file?.name }}</p>
            <p>檔案大小: {{ file ? formatFileSize(file.size) : '' }}</p>
          </div>
        </div>
      </el-form-item>
      <el-button type="primary" @click="submit" :loading="uploading" :disabled="uploading">
        {{ uploading ? '上傳中...' : '送出祝福' }}
      </el-button>
    </el-form>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue'
  import { ElMessage } from 'element-plus'
  
  const name = ref('')
  const text = ref('')
  const file = ref<File | null>(null)
  const uploading = ref(false)
  const previewUrl = ref('')
  const uploadMode = ref('image') // 'image' 或 'text'
  const { uploadMessage } = useApi()
  const { isValidImageType, getImagePreviewUrl, formatFileSize } = useMinio()
  
  async function onFileChange(uploadFile: any) {
    const selectedFile = uploadFile.raw
    
    // 檔案類型驗證
    if (!isValidImageType(selectedFile)) {
      ElMessage.error('只能上傳圖片檔案')
      return
    }
    
    // 檔案大小驗證 (5MB)
    const maxSize = 5 * 1024 * 1024
    if (selectedFile.size > maxSize) {
      ElMessage.error('檔案大小不能超過 5MB')
      return
    }
    
    file.value = selectedFile
    
    try {
      previewUrl.value = await getImagePreviewUrl(selectedFile)
    } catch (error) {
      ElMessage.error('預覽圖片失敗')
      console.error('預覽錯誤:', error)
    }
  }
  
  function onFileRemove() {
    file.value = null
    previewUrl.value = ''
  }
  
  function onModeChange() {
    // 當切換到純文字模式時，清除已選擇的圖片
    if (uploadMode.value === 'text') {
      file.value = null
      previewUrl.value = ''
    }
  }
  
  async function submit() {
    if (!name.value.trim()) {
      ElMessage.error('請輸入您的姓名')
      return
    }

    if (!text.value.trim()) {
      ElMessage.error('請輸入祝福內容')
      return
    }

    if (text.value.length > 50) {
      ElMessage.error('祝福內容不能超過50字')
      return
    }
    
    // 圖片模式下必須選擇圖片
    if (uploadMode.value === 'image' && !file.value) {
      ElMessage.error('請選擇圖片')
      return
    }

    uploading.value = true
    
    try {
      const formData = new FormData()
      
      // 只有在圖片模式下才添加檔案
      if (uploadMode.value === 'image' && file.value) {
        formData.append('file', file.value)
      }
      
      formData.append('name', name.value.trim())
      formData.append('text', text.value)
      formData.append('uploadMode', uploadMode.value) // 添加上傳模式標識

      await uploadMessage(formData)
      
      ElMessage.success('祝福已送出！')
      
      // 重置表單
      name.value = ''
      text.value = ''
      file.value = null
      previewUrl.value = ''
      uploadMode.value = 'image'
      
      // 返回首頁
      await navigateTo('/')
    } catch (error) {
      ElMessage.error('上傳失敗，請重試')
      console.error('上傳錯誤:', error)
    } finally {
      uploading.value = false
    }
  }
  </script>

  <style scoped>
  .upload-mode-selector {
    margin-bottom: 1rem;
  }
  
  .image-upload-section {
    margin-top: 1rem;
  }
  
  .text-mode-tip {
    margin-top: 1rem;
  }

  .image-preview {
    margin-top: 1rem;
    border: 1px solid #dcdfe6;
    border-radius: 8px;
    padding: 1rem;
    background-color: #f5f7fa;
  }

  .image-preview img {
    max-width: 100%;
    max-height: 200px;
    object-fit: contain;
    border-radius: 4px;
    display: block;
    margin: 0 auto;
  }

  .preview-info {
    margin-top: 0.5rem;
    font-size: 14px;
    color: #606266;
  }

  .preview-info p {
    margin: 0.25rem 0;
  }

  .el-upload__tip {
    color: #909399;
    font-size: 12px;
    margin-top: 0.5rem;
  }
  </style>