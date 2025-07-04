<template>
  <div class="walls-page">
    <div class="container">
      <!-- 用戶資訊 -->
      <div class="user-header">
        <img 
          v-if="authStore.userProfile?.picture" 
          :src="authStore.userProfile.picture" 
          :alt="authStore.userProfile.name"
          class="user-avatar"
        >
        <div class="user-info">
          <h1>{{ authStore.userProfile?.name || '用戶' }}的祝福墻</h1>
          <p>{{ authStore.userProfile?.email }}</p>
        </div>
      </div>

      <!-- 暫時顯示登入成功訊息 -->
      <el-card class="success-card">
        <el-result
          icon="success"
          title="登入成功！"
          sub-title="您已成功使用 Google 帳號登入"
        >
          <template #extra>
            <div class="debug-info">
              <h3>除錯資訊：</h3>
              <pre>{{ debugInfo }}</pre>
            </div>
            <el-button type="primary" @click="logout">登出</el-button>
          </template>
        </el-result>
      </el-card>

      <!-- 未來這裡會顯示用戶的墻列表 -->
      <el-alert 
        type="info" 
        :closable="false"
        class="future-feature"
      >
        <template #title>
          <span>多墻功能即將推出！這裡將顯示您創建的所有祝福墻。</span>
        </template>
      </el-alert>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const userId = route.params.userId as string

// 驗證用戶是否已登入且 userId 匹配
if (!authStore.isAuthenticated || authStore.userId !== userId) {
  throw createError({
    statusCode: 403,
    statusMessage: 'Unauthorized'
  })
}

// 除錯資訊
const debugInfo = computed(() => ({
  userId: authStore.userId,
  userEmail: authStore.userProfile?.email,
  userName: authStore.userProfile?.name,
  provider: authStore.ssoProvider,
  isAuthenticated: authStore.isAuthenticated,
  hasAccessToken: !!authStore.accessToken,
  sessionExpiry: authStore.sessionExpiry ? new Date(authStore.sessionExpiry).toLocaleString() : null
}))

// 登出
async function logout() {
  authStore.logout()
  await router.push('/')
}
</script>

<style scoped>
.walls-page {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 2rem 1rem;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.user-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.user-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
}

.user-info h1 {
  margin: 0 0 0.5rem 0;
  font-size: 1.8rem;
  color: #333;
}

.user-info p {
  margin: 0;
  color: #666;
}

.success-card {
  margin-bottom: 2rem;
}

.debug-info {
  text-align: left;
  margin: 2rem 0;
}

.debug-info h3 {
  margin-bottom: 1rem;
  color: #666;
}

.debug-info pre {
  background: #f5f7fa;
  padding: 1rem;
  border-radius: 8px;
  overflow-x: auto;
  font-size: 0.875rem;
}

.future-feature {
  margin-top: 2rem;
}
</style>