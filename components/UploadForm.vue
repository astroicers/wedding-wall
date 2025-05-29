<template>
    <el-form @submit.prevent>
      <el-form-item label="祝福的話">
        <el-input v-model="text" placeholder="請輸入祝福內容" type="textarea" rows="3" />
      </el-form-item>
      <el-form-item label="上傳圖片">
        <el-upload
          class="upload-demo"
          :on-change="onFileChange"
          :auto-upload="false"
        >
          <el-button>選擇圖片</el-button>
        </el-upload>
      </el-form-item>
      <el-button type="primary" @click="submit">送出祝福</el-button>
    </el-form>
  </template>
  
  <script setup lang="ts">
  const text = ref('')
  const file = ref<File | null>(null)
  const photoUrl = ref('')
  const messages = useMessages()
  const auth = useAuth()
  
  function onFileChange(uploadFile: any) {
    file.value = uploadFile.raw
  }
  
  async function submit() {
    if (!auth.value) return alert('請先登入')
    if (!file.value) return alert('請選擇圖片')
  
    const formData = new FormData()
    formData.append('file', file.value)
    formData.append('name', auth.value)
    formData.append('text', text.value)
  
    const res = await fetch('/api/upload', { method: 'POST', body: formData })
    const data = await res.json()
    photoUrl.value = data.url
  
    // 返回首頁等待下一則
    navigateTo('/')
  }
  </script>