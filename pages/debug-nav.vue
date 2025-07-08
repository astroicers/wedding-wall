<template>
  <div class="debug-nav">
    <h1>導航測試頁面</h1>
    
    <div class="test-section">
      <h2>測試連結</h2>
      <div class="link-grid">
        <nuxt-link to="/104445071947647440200/walls/wall_1751972216126_30019wefc">
          <el-button type="primary">墻管理頁面</el-button>
        </nuxt-link>
        
        <nuxt-link to="/104445071947647440200/walls/wall_1751972216126_30019wefc/gallery">
          <el-button type="success">相簿頁面</el-button>
        </nuxt-link>
        
        <nuxt-link to="/wall/wall_1751972216126_30019wefc">
          <el-button type="warning">公開墻頁面</el-button>
        </nuxt-link>
        
        <nuxt-link to="/gallery-simple">
          <el-button type="info">簡單相簿測試</el-button>
        </nuxt-link>
      </div>
    </div>
    
    <div class="test-section">
      <h2>JavaScript 導航測試</h2>
      <div class="link-grid">
        <el-button @click="testRouterPush">router.push 測試</el-button>
        <el-button @click="testNavigateTo">navigateTo 測試</el-button>
        <el-button @click="testWindowLocation">window.location 測試</el-button>
        <el-button @click="testWindowOpen">window.open 測試</el-button>
      </div>
    </div>
    
    <div class="info-section">
      <h3>當前路由信息</h3>
      <p>路徑: {{ $route.path }}</p>
      <p>參數: {{ JSON.stringify($route.params) }}</p>
      <p>查詢: {{ JSON.stringify($route.query) }}</p>
    </div>
  </div>
</template>

<script setup>
const router = useRouter()

const testRouterPush = async () => {
  try {
    await router.push('/104445071947647440200/walls/wall_1751972216126_30019wefc/gallery')
    console.log('router.push 成功')
  } catch (error) {
    console.error('router.push 失敗:', error)
  }
}

const testNavigateTo = async () => {
  try {
    await navigateTo('/104445071947647440200/walls/wall_1751972216126_30019wefc/gallery')
    console.log('navigateTo 成功')
  } catch (error) {
    console.error('navigateTo 失敗:', error)
  }
}

const testWindowLocation = () => {
  window.location.href = '/104445071947647440200/walls/wall_1751972216126_30019wefc/gallery'
}

const testWindowOpen = () => {
  window.open('/104445071947647440200/walls/wall_1751972216126_30019wefc/gallery', '_blank')
}

useHead({
  title: '導航測試頁面'
})
</script>

<style scoped>
.debug-nav {
  padding: 40px;
  max-width: 800px;
  margin: 0 auto;
}

.test-section {
  margin: 30px 0;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.link-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-top: 15px;
}

.info-section {
  margin-top: 30px;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 8px;
}

.info-section p {
  margin: 5px 0;
  font-family: monospace;
}
</style>