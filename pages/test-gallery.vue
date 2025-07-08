<template>
  <div class="test-page">
    <h1>測試頁面</h1>
    <p>這是一個測試頁面，用來驗證路由是否正常工作</p>
    <p>當前時間: {{ new Date().toLocaleString() }}</p>
    
    <div style="margin-top: 20px;">
      <el-button @click="goBack">返回</el-button>
      <el-button @click="testNavigation" type="primary">測試導航</el-button>
    </div>
  </div>
</template>

<script setup>
const router = useRouter()

const goBack = () => {
  router.back()
}

const testNavigation = () => {
  router.push('/104445071947647440200/walls/wall_1751972216126_30019wefc/gallery')
}

useHead({
  title: '測試頁面'
})
</script>

<style scoped>
.test-page {
  padding: 40px;
  text-align: center;
}
</style>