<template>
  <div class="gallery-simple">
    <h1>簡單相簿測試</h1>
    <p>Wall ID: {{ wallId }}</p>
    <p>User ID: {{ userId }}</p>
    
    <div v-if="messages.length > 0" class="messages-list">
      <h2>找到 {{ messages.length }} 條消息</h2>
      <div v-for="msg in messages" :key="msg.id" class="message-item">
        <img v-if="msg.imagePath" :src="`/api/image/${msg.imagePath}`" style="width: 200px; height: 150px; object-fit: cover;" />
        <div>
          <strong>{{ msg.name }}</strong>: {{ msg.message }}
        </div>
      </div>
    </div>
    
    <div v-else>
      <p>沒有找到消息</p>
    </div>
    
    <div style="margin-top: 20px;">
      <el-button @click="loadMessages">重新載入</el-button>
      <el-button @click="goBack">返回</el-button>
    </div>
  </div>
</template>

<script setup>
const route = useRoute()
const router = useRouter()

const wallId = ref('wall_1751972216126_30019wefc')
const userId = ref('104445071947647440200')
const messages = ref([])

const loadMessages = async () => {
  try {
    console.log('Loading messages...')
    const response = await $fetch(`/api/users/${userId.value}/walls/${wallId.value}/messages`)
    messages.value = response.messages || []
    console.log('Messages loaded:', messages.value)
  } catch (error) {
    console.error('Failed to load messages:', error)
  }
}

const goBack = () => {
  router.back()
}

onMounted(() => {
  loadMessages()
})
</script>

<style scoped>
.gallery-simple {
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
}

.message-item {
  border: 1px solid #ddd;
  padding: 15px;
  margin: 10px 0;
  border-radius: 8px;
  display: flex;
  gap: 15px;
  align-items: center;
}
</style>