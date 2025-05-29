<template>
    <el-container class="gallery-wrapper">
      <el-header class="gallery-header">
        <el-row justify="center">
          <el-col :span="24" style="text-align: center">
            <h2>婚禮祝福相簿</h2>
          </el-col>
        </el-row>
      </el-header>
      <el-main>
        <el-row :gutter="20">
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
      </el-main>
    </el-container>
  </template>
  
  <script setup lang="ts">
  const imageList = ref<string[]>([])
  const previewVisible = ref(false)
  const selectedImage = ref('')
  
  function openPreview(img: string) {
    selectedImage.value = img
    previewVisible.value = true
  }
  
  function downloadImage(url: string) {
    const a = document.createElement('a')
    a.href = url
    a.download = url.split('/').pop() || 'download.jpg'
    a.click()
  }
  
  onMounted(async () => {
    const res = await fetch('/api/metadata')
    const data = await res.json()
    imageList.value = data.map((m: any) => m.photo)
  })
  </script>
  
  <style scoped>
  .gallery-wrapper {
    padding-top: 1rem;
  }
  .gallery-header {
    padding-bottom: 2rem;
  }
  
  .image-card {
    margin-bottom: 1.5rem;
  }
  
  .thumb {
    width: 100%;
    height: 180px;
    object-fit: cover;
    border-radius: 8px;
    cursor: pointer;
    transition: transform 0.2s;
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
  </style>