<template>
  <div class="gallery-page">
    <div class="gallery-header">
      <div class="header-content">
        <el-icon size="48" color="#409EFF">
          <Picture />
        </el-icon>
        <h2>🖼️ 婚禮祝福相簿</h2>
        <p>瀏覽所有美好回憶</p>
        <div class="stats" v-if="imageList.length > 0">
          <span>共 {{ imageList.length }} 張照片</span>
        </div>
        <div class="actions" v-if="imageList.length > 0">
          <el-button 
            type="primary" 
            :loading="downloading" 
            @click="downloadAllPhotos"
            :disabled="downloading"
          >
            <el-icon v-if="!downloading">
              <Download />
            </el-icon>
            {{ downloading ? '準備下載中...' : '下載所有照片 (ZIP)' }}
          </el-button>
        </div>
      </div>
    </div>
    
    <div class="gallery-content">
        <div v-if="loading" style="text-align: center; padding: 2rem;">
          <el-loading-spinner size="large" />
          <p>載入中...</p>
        </div>
        
        <div v-else-if="imageList.length === 0" style="text-align: center; padding: 2rem;">
          <p>還沒有照片，快去上傳第一張吧！</p>
          <el-button type="primary" @click="navigateTo('/')">前往上傳</el-button>
        </div>
        
        <el-row v-else :gutter="20">
          <el-col
            v-for="img in imageList"
            :key="img"
            :xs="12" :sm="8" :md="6" :lg="4"
          >
            <el-card shadow="hover" @click="openPreview(img)" class="image-card">
              <img :src="img" class="thumb" />
            </el-card>
          </el-col>
        </el-row>
  
        <el-dialog v-model="previewVisible" width="auto" :show-close="true" center>
          <img :src="selectedImage" class="full-image" />
          <div style="text-align:center; margin-top: 1rem">
            <el-button type="primary" @click="downloadImage(selectedImage)">下載圖片</el-button>
          </div>
        </el-dialog>
    </div>
  </div>
</template>
  
  <script setup lang="ts">
  import { Picture, Download } from '@element-plus/icons-vue'
  
  const imageList = ref<string[]>([])
  const previewVisible = ref(false)
  const selectedImage = ref('')
  const loading = ref(false)
  const downloading = ref(false)
  const { fetchMessages } = useApi()

  // 設定頁面 meta
  useHead({
    title: '婚禮相簿 - 婚禮祝福牆',
    meta: [
      { name: 'description', content: '瀏覽婚禮祝福牆的所有照片，下載美好回憶！' }
    ]
  })
  
  function openPreview(img: string) {
    selectedImage.value = img
    previewVisible.value = true
  }
  
  function downloadImage(url: string) {
    try {
      const a = document.createElement('a')
      a.href = url
      a.download = url.split('/').pop() || 'download.jpg'
      a.click()
      ElMessage.success('開始下載圖片')
    } catch (error) {
      ElMessage.error('下載失敗')
      console.error('下載錯誤:', error)
    }
  }

  async function downloadAllPhotos() {
    if (downloading.value) return
    
    downloading.value = true
    try {
      ElMessage.info('正在準備下載所有照片，請稍候...')
      
      const response = await fetch('/api/download-all', {
        method: 'GET',
        headers: {
          'Accept': 'application/zip'
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      // 獲取檔案內容
      const blob = await response.blob()
      
      // 創建下載連結
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `wedding-photos-${new Date().toISOString().split('T')[0]}.zip`
      document.body.appendChild(a)
      a.click()
      
      // 清理
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      
      ElMessage.success(`成功下載 ${imageList.value.length} 張照片！`)
    } catch (error) {
      console.error('批量下載失敗:', error)
      ElMessage.error('下載失敗，請稍後再試')
    } finally {
      downloading.value = false
    }
  }
  
  onMounted(async () => {
    loading.value = true
    try {
      const data = await fetchMessages()
      imageList.value = data
        .filter(m => m.photo)
        .map(m => m.photo!)
    } catch (error) {
      ElMessage.error('載入相簿失敗')
      console.error('載入錯誤:', error)
    } finally {
      loading.value = false
    }
  })
  </script>
  
  <style scoped>
  .gallery-page {
    min-height: calc(100vh - 80px);
    padding: 2rem 1rem;
  }

  .gallery-header {
    text-align: center;
    margin-bottom: 2rem;
  }

  .header-content {
    background: rgba(255, 255, 255, 0.9);
    border-radius: 16px;
    padding: 2rem;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    max-width: 600px;
    margin: 0 auto;
  }

  .header-content h2 {
    margin: 1rem 0 0.5rem 0;
    color: #2c3e50;
    font-size: 1.8rem;
    font-weight: 600;
  }

  .header-content p {
    margin: 0 0 1rem 0;
    color: #7f8c8d;
    font-size: 1rem;
  }

  .stats {
    background: rgba(64, 158, 255, 0.1);
    color: #409EFF;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    display: inline-block;
    font-weight: 500;
    font-size: 0.9rem;
    margin-bottom: 1rem;
  }

  .actions {
    margin-top: 1rem;
  }

  .actions .el-button {
    background: linear-gradient(135deg, #67C23A 0%, #85CE61 100%);
    border: none;
    padding: 0.75rem 1.5rem;
    font-weight: 600;
    border-radius: 25px;
    box-shadow: 0 4px 12px rgba(103, 194, 58, 0.3);
    transition: all 0.3s ease;
  }

  .actions .el-button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(103, 194, 58, 0.4);
  }

  .actions .el-button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .gallery-content {
    max-width: 1200px;
    margin: 0 auto;
  }

  .image-card {
    margin-bottom: 1.5rem;
    border-radius: 12px;
    overflow: hidden;
    transition: all 0.3s ease;
  }

  .image-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.15);
  }

  .thumb {
    width: 100%;
    height: 200px;
    object-fit: cover;
    cursor: pointer;
    transition: transform 0.3s ease;
  }

  .thumb:hover {
    transform: scale(1.05);
  }

  .full-image {
    max-width: 90vw;
    max-height: 80vh;
    display: block;
    margin: 0 auto;
    border-radius: 12px;
  }

  /* 載入和空狀態樣式 */
  .gallery-content > div {
    background: rgba(255, 255, 255, 0.9);
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }

  @media (max-width: 768px) {
    .gallery-page {
      padding: 1rem 0.5rem;
    }
    
    .header-content {
      padding: 1.5rem;
    }
    
    .header-content h2 {
      font-size: 1.5rem;
    }
    
    .thumb {
      height: 150px;
    }
  }

  @media (max-width: 480px) {
    .header-content {
      padding: 1rem;
    }
    
    .thumb {
      height: 120px;
    }
  }
  </style>