<template>
  <div class="login-page">
    <div class="login-container">
      <h1 class="login-title">歡迎使用祝福墻</h1>
      <p class="login-subtitle">請使用 Google 帳號登入</p>
      
      <!-- Google 登入按鈕 -->
      <el-button
        class="login-button google-button"
        size="large"
        @click="loginWithGoogle"
        :loading="loading"
      >
        <svg class="google-icon" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        使用 Google 帳號登入
      </el-button>
      
      
      <!-- 錯誤訊息 -->
      <el-alert
        v-if="errorMessage"
        :title="errorMessage"
        type="error"
        :closable="false"
        class="error-alert"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const loading = ref(false)
const errorMessage = ref('')

// 檢查是否有錯誤參數和已登入狀態
onMounted(async () => {
  console.log('🔐 Login page mounted, checking authentication status...')
  
  // 等待 app.vue 中的會話恢復完成
  await nextTick()
  let waitCount = 0
  while (!window.__SESSION_RESTORE_COMPLETED && waitCount < 20) {
    await new Promise(resolve => setTimeout(resolve, 50))
    waitCount++
  }
  
  // 檢查 app.vue 恢復的會話狀態
  const sessionRestored = authStore.isAuthenticated && authStore.userId && authStore.isSessionValid
  
  console.log('🔐 Login page session check:', {
    restored: sessionRestored,
    isAuthenticated: authStore.isAuthenticated,
    userId: authStore.userId,
    hasToken: !!authStore.accessToken,
    isSessionValid: authStore.isSessionValid
  })
  
  // 如果已經登入，重定向到用戶的祝福牆列表
  if (sessionRestored && authStore.isAuthenticated && authStore.userId && authStore.isSessionValid) {
    console.log('✅ User already authenticated, redirecting to walls list...')
    router.push(`/${authStore.userId}/walls`)
    return
  }
  
  // 檢查是否有錯誤參數
  if (route.query.error === 'auth_failed') {
    errorMessage.value = '登入失敗，請重試'
  }
})

// Google 登入
async function loginWithGoogle() {
  loading.value = true
  try {
    await authStore.loginWithSSO('google')
  } catch (error) {
    console.error('Login error:', error)
    errorMessage.value = '無法啟動 Google 登入'
    loading.value = false
  }
}

</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
}

.login-container {
  background: white;
  padding: 3rem 2rem;
  border-radius: 1rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  width: 100%;
}

.login-title {
  text-align: center;
  color: #333;
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.login-subtitle {
  text-align: center;
  color: #666;
  margin-bottom: 2rem;
}

.login-button {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 500;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.google-button {
  border: 1px solid #dadce0;
  color: #3c4043;
  background-color: white;
  transition: all 0.3s;
}

.google-button:hover {
  background-color: #f8f9fa;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.google-icon {
  width: 20px;
  height: 20px;
}


.error-alert {
  margin-top: 1.5rem;
}
</style>