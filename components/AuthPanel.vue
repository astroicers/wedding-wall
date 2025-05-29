<template>
    <div>
      <el-button type="success" @click="login('LINE')">使用 LINE 登入</el-button>
      <el-button type="primary" @click="login('FB')">使用 Facebook 登入</el-button>
      <el-input v-model="name" placeholder="填寫名字後直接發訊息" style="margin-top: 1rem" />
      <el-button @click="anonymousLogin" style="margin-top: 0.5rem">確定</el-button>
    </div>
  </template>
  
  <script setup lang="ts">
  const name = ref('')
  const auth = useAuth()
  
  function login(provider: string) {
    auth.value = `${provider}使用者`
    navigateTo('/upload')
  }
  
  function anonymousLogin() {
    if (name.value) {
      auth.value = name.value
      navigateTo('/upload')
    }
  }
  </script>