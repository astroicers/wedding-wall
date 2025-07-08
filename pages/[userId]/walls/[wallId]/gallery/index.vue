<!-- 這個文件重定向到父級 gallery.vue -->
<script setup>
const route = useRoute()
const router = useRouter()

// 立即重定向到正確的 gallery 路由
router.replace(`/${route.params.userId}/walls/${route.params.wallId}/gallery`)
</script>

<template>
  <div>重定向中...</div>
</template>