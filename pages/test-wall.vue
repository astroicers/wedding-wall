<template>
  <div class="test-wall">
    <h1>测试祝福墙页面</h1>
    <p>Wall ID: {{ wallId }}</p>
    <p>Loading: {{ loading }}</p>
    <p>Wall exists: {{ !!wall }}</p>
    
    <div v-if="wall" class="wall-info">
      <h2>墙信息</h2>
      <p>名称: {{ wall.name }}</p>
      <p>ID: {{ wall.id }}</p>
      <p>活跃状态: {{ wall.isActive }}</p>
    </div>
    
    <div v-else-if="loading" class="loading">
      <p>正在加载...</p>
    </div>
    
    <div v-else class="error">
      <p>找不到祝福墙</p>
    </div>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { useWallsStore } from '~/stores/walls'
import { useAuthStore } from '~/stores/auth'

const route = useRoute()
const wallsStore = useWallsStore()
const authStore = useAuthStore()

const wallId = computed(() => route.params.wallId)
const userId = computed(() => route.params.userId)
const wall = ref(null)
const loading = ref(true)

onMounted(async () => {
  console.log('Test page mounted with:', {
    wallId: wallId.value,
    userId: userId.value,
    isAuthenticated: authStore.isAuthenticated
  })
  
  try {
    // 获取墙列表
    await wallsStore.fetchUserWalls(userId.value)
    console.log('Available walls:', wallsStore.walls)
    
    // 查找特定的墙
    wall.value = wallsStore.walls.find(w => w.id === wallId.value)
    console.log('Found wall:', wall.value)
    
  } catch (error) {
    console.error('Error loading wall:', error)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.test-wall {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.wall-info {
  background: #f0f0f0;
  padding: 20px;
  border-radius: 8px;
  margin-top: 20px;
}

.loading {
  text-align: center;
  padding: 40px;
}

.error {
  text-align: center;
  padding: 40px;
  color: red;
}
</style>