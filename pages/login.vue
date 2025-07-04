<template>
  <div>
    <!-- 自動重新導向到新的 OAuth 登入頁 -->
  </div>
</template>

<script setup>
// 自動重新導向到新的 OAuth 登入頁面
await navigateTo('/auth/login')
</script>