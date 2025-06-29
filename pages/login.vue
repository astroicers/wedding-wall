<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <h1>🎊 婚禮祝福牆</h1>
          <p>請輸入密碼進入</p>
        </div>
        
        <el-form @submit.prevent="handleLogin" class="login-form">
          <el-form-item>
            <el-input
              v-model="password"
              type="password"
              size="large"
              placeholder="請輸入密碼"
              show-password
              @keyup.enter="handleLogin"
              :disabled="loading"
            >
              <template #prefix>
                <el-icon><Lock /></el-icon>
              </template>
            </el-input>
          </el-form-item>
          
          <el-form-item>
            <el-button
              type="primary"
              size="large"
              :loading="loading"
              @click="handleLogin"
              class="login-button"
            >
              進入祝福牆
            </el-button>
          </el-form-item>
        </el-form>

        <div v-if="errorMessage" class="error-message">
          <el-alert
            :title="errorMessage"
            type="error"
            :closable="false"
            show-icon
          />
        </div>

        <div class="login-footer">
          <p>💝 為新人送上最美好的祝福</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Lock } from '@element-plus/icons-vue'

// Disable auth middleware for this page
definePageMeta({
  middleware: []
})

const password = ref('')
const loading = ref(false)
const errorMessage = ref('')
const authStore = useAuthStore()
const router = useRouter()

const handleLogin = async () => {
  if (!password.value) {
    errorMessage.value = '請輸入密碼'
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    const response = await $fetch('/api/auth/login', {
      method: 'POST',
      body: {
        password: password.value
      }
    })

    if (response.success) {
      // Set authentication
      authStore.setAuthenticated(true)
      
      // Redirect to home
      await router.push('/')
      
      ElMessage.success('登入成功')
    } else {
      errorMessage.value = response.message || '密碼錯誤'
    }
  } catch (error) {
    console.error('Login error:', error)
    errorMessage.value = '密碼錯誤，請重試'
  } finally {
    loading.value = false
  }
}

// Clear error when typing
watch(password, () => {
  if (errorMessage.value) {
    errorMessage.value = ''
  }
})
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
  width: 100%;
  max-width: 400px;
}

.login-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 2.5rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-header h1 {
  font-size: 2rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.login-header p {
  color: #7f8c8d;
  font-size: 1rem;
}

.login-form {
  margin-bottom: 1rem;
}

.login-button {
  width: 100%;
  height: 48px;
  font-size: 1.1rem;
  font-weight: 600;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  transition: all 0.3s ease;
}

.login-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.error-message {
  margin-bottom: 1rem;
}

.login-footer {
  text-align: center;
  color: #95a5a6;
  font-size: 0.9rem;
}

.login-footer p {
  margin: 0;
}

:deep(.el-input__wrapper) {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
}

:deep(.el-input__wrapper:hover) {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

:deep(.el-alert) {
  border-radius: 10px;
}

@media (max-width: 480px) {
  .login-card {
    padding: 2rem 1.5rem;
  }
  
  .login-header h1 {
    font-size: 1.75rem;
  }
}
</style>