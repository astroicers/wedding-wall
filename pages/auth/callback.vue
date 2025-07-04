<template>
  <div class="auth-callback">
    <div class="loading-container">
      <el-icon class="is-loading" :size="60">
        <Loading />
      </el-icon>
      <h2>正在登入...</h2>
      <p v-if="error" class="error-message">{{ error }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Loading } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const error = ref<string | null>(null)

onMounted(async () => {
  try {
    const code = route.query.code as string
    const state = route.query.state as string
    
    if (!code) {
      throw new Error('Missing authorization code')
    }
    
    // 如果 ssoProvider 為空，預設為 google
    if (!authStore.ssoProvider) {
      authStore.ssoProvider = 'google'
    }
    
    await authStore.handleSSOCallback(code, state)
    
    // 導向用戶的墻列表
    await router.push(`/${authStore.userId}/walls`)
  } catch (err: any) {
    console.error('Authentication failed:', err)
    error.value = err.message || '登入失敗'
    
    // 3 秒後導向登入頁
    setTimeout(() => {
      router.push('/auth/login?error=auth_failed')
    }, 3000)
  }
})
</script>

<style scoped>
.auth-callback {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.loading-container {
  text-align: center;
  background: white;
  padding: 3rem;
  border-radius: 1rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.loading-container h2 {
  margin-top: 1.5rem;
  color: #333;
  font-size: 1.5rem;
}

.error-message {
  color: #f56c6c;
  margin-top: 1rem;
}

.is-loading {
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>