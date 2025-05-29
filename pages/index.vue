<template>
  <div class="container">
    <h2>君君與阿傑婚禮祝福牆</h2>
    <p>歡迎上傳照片或留言祝福，為我們留下美好回憶</p>
    <AuthPanel />
  </div>
</template>

<script setup>
import AuthPanel from '~/components/AuthPanel.vue'
</script>

<style scoped>
.container {
  max-width: 480px;
  margin: 0 auto;
  text-align: center;
  padding-top: 100px;
}
</style>