<template>
  <div class="redirect-screen">
    <div class="loading-spinner">🔄</div>
    <p>重新導向中...</p>
  </div>
</template>

<script setup lang="ts">
// 重新導向到扁平路由結構
const route = useRoute()
const userId = route.params.userId as string
const wallId = route.params.wallId as string

// 立即重新導向到扁平路由
const flatUrl = `/gallery-${userId}-${wallId}`
await navigateTo(flatUrl, { replace: true })
</script>

<style scoped>
.redirect-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-align: center;
  gap: 1rem;
  font-size: 1.2rem;
}

.loading-spinner {
  font-size: 2rem;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>