<template>
  <div class="fullscreen-layout">
    <div v-if="loading" class="loading-screen">
      <div class="loading-spinner">🔄</div>
      <p>載入祝福牆中...</p>
    </div>
    
    <div v-else-if="error" class="error-screen">
      <div class="error-icon">⚠️</div>
      <h3>{{ error }}</h3>
      <p>調試信息: userId={{ userId }}, wallId={{ wallId }}, mode={{ mode }}</p>
      <div class="error-actions">
        <el-button type="primary" @click="() => navigateTo(`/${userId}/walls/${wallId}`)">返回牆管理</el-button>
        <el-button @click="() => navigateTo(`/${userId}/walls`)">返回牆列表</el-button>
      </div>
    </div>
    
    <component 
      v-else 
      :is="currentComponent" 
      :messages="messages"
      :wall-settings="wallSettings"
      :wall-id="wallId"
      :user-id="userId"
    />
  </div>
</template>

<script setup lang="ts">

// 動態導入組件
const WallDefault = defineAsyncComponent(() => import('~/components/WallDefault.vue'))
const WallGrid = defineAsyncComponent(() => import('~/components/WallGrid.vue'))
const WallPolaroid = defineAsyncComponent(() => import('~/components/WallPolaroid.vue'))
const WallMagazine = defineAsyncComponent(() => import('~/components/WallMagazine.vue'))
const WallStories = defineAsyncComponent(() => import('~/components/WallStories.vue'))
const WallEnhanced = defineAsyncComponent(() => import('~/components/WallEnhanced.vue'))

const route = useRoute()

// 路由參數
const userId = computed(() => route.params.userId as string)
const wallId = computed(() => route.params.wallId as string)
const mode = computed(() => route.params.mode as string)

// 響應式數據
const loading = ref(true)
const error = ref('')
const messages = ref([])
const wallSettings = ref({})

// 支持的顯示模式
const supportedModes = ['default', 'grid', 'polaroid', 'magazine', 'stories', 'enhanced']

// 組件映射
const componentMap = {
  default: WallDefault,
  grid: WallGrid,
  polaroid: WallPolaroid,
  magazine: WallMagazine,
  stories: WallStories,
  enhanced: WallEnhanced
}

// 當前組件
const currentComponent = computed(() => {
  const modeName = mode.value
  if (!supportedModes.includes(modeName)) {
    return null
  }
  return componentMap[modeName]
})

// 載入祝福牆數據
const loadWallData = async () => {
  try {
    loading.value = true
    error.value = ''
    
    console.log('🔍 Loading wall data:', { userId: userId.value, wallId: wallId.value, mode: mode.value })
    
    // 驗證模式
    if (!supportedModes.includes(mode.value)) {
      throw new Error(`不支持的顯示模式: ${mode.value}`)
    }
    
    // 載入祝福牆資訊
    console.log('📡 Fetching wall info from:', `/api/users/${userId.value}/walls/${wallId.value}`)
    const wallResponse = await $fetch(`/api/users/${userId.value}/walls/${wallId.value}`)
    console.log('📦 Wall response:', wallResponse)
    
    if (!wallResponse.success) {
      throw new Error(wallResponse.error || '無法載入祝福牆資訊')
    }
    
    wallSettings.value = wallResponse.wall.settings || {}
    console.log('⚙️ Wall settings:', wallSettings.value)
    
    // 載入祝福消息
    console.log('📡 Fetching messages from:', `/api/users/${userId.value}/walls/${wallId.value}/messages`)
    const messagesResponse = await $fetch(`/api/users/${userId.value}/walls/${wallId.value}/messages`)
    console.log('📦 Messages response:', messagesResponse)
    
    // Check if the response indicates success
    if (messagesResponse.success === false) {
      throw new Error(messagesResponse.error || '無法載入祝福消息')
    }
    
    messages.value = messagesResponse.messages || []
    
  } catch (err) {
    console.error('❌ 載入祝福牆失敗:', err)
    error.value = err.message || '載入失敗，請稍後再試'
  } finally {
    loading.value = false
  }
}

// 設定頁面標題
const getPageTitle = (modeName: string) => {
  const modeNames = {
    default: '經典',
    grid: '網格',
    polaroid: '拍立得',
    magazine: '雜誌',
    stories: '故事',
    enhanced: '增強'
  }
  return `${modeNames[modeName] || modeName} 祝福牆`
}

// 禁用默認布局，設置為全屏
definePageMeta({
  layout: false
})

useHead(() => ({
  title: `${getPageTitle(mode.value)} - 婚禮祝福牆`,
  meta: [
    { name: 'description', content: `${getPageTitle(mode.value)}風格的祝福牆展示` }
  ]
}))

// 監聽路由變化
watch([userId, wallId, mode], () => {
  console.log('👀 Route changed, loading wall data...', { userId: userId.value, wallId: wallId.value, mode: mode.value })
  loadWallData()
}, { immediate: true })

onMounted(async () => {
  console.log('🎯 Wall display page mounted', { 
    userId: userId.value, 
    wallId: wallId.value, 
    mode: mode.value,
    supportedModes,
    currentComponent: currentComponent.value
  })
  
  // 如果組件不存在，重定向到默認模式
  if (!currentComponent.value) {
    console.log('❌ No component found for mode:', mode.value, 'redirecting to default')
    await navigateTo(`/wall-display-${userId.value}-${wallId.value}-default`, { replace: true })
  } else {
    console.log('✅ Component found:', currentComponent.value)
  }
})
</script>

<style scoped>
.fullscreen-layout {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
  overflow: hidden;
}

.loading-screen,
.error-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-align: center;
  gap: 1rem;
}

.loading-screen p,
.error-screen h3 {
  margin: 0;
  font-size: 1.2rem;
}

.error-screen h3 {
  color: #f56c6c;
  margin-bottom: 1rem;
}

.loading-spinner {
  font-size: 2rem;
  animation: spin 1s linear infinite;
}

.error-icon {
  font-size: 4rem;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.error-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}
</style>