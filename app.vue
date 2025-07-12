<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup>
// 使用 Pinia Stores 初始化應用
const uiStore = useUIStore()

onMounted(() => {
  // 初始化 UI 設定
  uiStore.initializeUI()
  
  console.log('祝福牆應用已啟動，使用 Pinia 狀態管理')
})
</script>