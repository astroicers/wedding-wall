<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup>
// 使用 Pinia Stores 初始化應用
const uiStore = useUIStore()
const authStore = useAuthStore()

// 使用 onMounted 確保在客戶端 hydration 完成後執行
onMounted(async () => {
  console.log('🚀 Wedding Wall App starting in client environment...')
  
  // 初始化 UI 設定
  uiStore.initializeUI()
  
  // 等待多個 tick 確保 DOM 和 Pinia 持久化都完成
  await nextTick()
  await nextTick()
  
  // 延遲一點時間確保所有持久化插件都已經載入完成
  setTimeout(async () => {
    console.log('🔄 App.vue: Attempting to restore user session after hydration...')
    const sessionRestored = authStore.restoreSession()
    
    console.log('📊 App.vue session restore result:', {
      restored: sessionRestored,
      isAuthenticated: authStore.isAuthenticated,
      userId: authStore.userId,
      hasToken: !!authStore.accessToken,
      sessionExpiry: authStore.sessionExpiry,
      isSessionValid: authStore.isSessionValid,
      currentTime: Date.now()
    })
    
    // 設置一個全局標記表明會話恢復已完成
    window.__SESSION_RESTORE_COMPLETED = true
    console.log('✅ App.vue: Session restoration completed and flagged')
  }, 50)
})
</script>