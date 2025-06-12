<template>
  <div class="upload-page">
    <div class="container">
      <div class="header">
        <el-icon size="48" color="#409EFF">
          <Upload />
        </el-icon>
        <h2>📸 上傳祝福</h2>
        <p>分享您的照片和美好祝願</p>
      </div>
      
      <div class="form-container">
        <UploadForm />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import UploadForm from '~/components/UploadForm.vue'
import { Upload } from '@element-plus/icons-vue'

const auth = useAuth()

// 設定頁面 meta
useHead({
  title: '上傳祝福 - 婚禮祝福牆',
  meta: [
    { name: 'description', content: '上傳您的照片和祝福訊息，與新人分享這個特別的時刻！' }
  ]
})

// 檢查是否已登入
watchEffect(() => {
  if (!auth.value && process.client) {
    navigateTo('/')
  }
})
</script>

<style scoped>
.upload-page {
  min-height: calc(100vh - 80px);
  padding: 2rem 1rem;
}

.container {
  max-width: 600px;
  margin: 0 auto;
}

.header {
  text-align: center;
  margin-bottom: 2rem;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.header h2 {
  margin: 1rem 0 0.5rem 0;
  color: #2c3e50;
  font-size: 1.8rem;
  font-weight: 600;
}

.header p {
  margin: 0;
  color: #7f8c8d;
  font-size: 1rem;
}

.form-container {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

@media (max-width: 768px) {
  .upload-page {
    padding: 1rem 0.5rem;
  }
  
  .header {
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }
  
  .header h2 {
    font-size: 1.5rem;
  }
  
  .form-container {
    padding: 1.5rem;
  }
}
</style>