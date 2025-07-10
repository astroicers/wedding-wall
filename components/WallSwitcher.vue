<template>
  <div class="wall-switcher">
    <el-dropdown @command="handleWallChange" trigger="click">
      <el-button type="primary" class="switcher-button">
        <el-icon><Grid /></el-icon>
        {{ currentWallName }}
        <el-icon class="el-icon--right"><ArrowDown /></el-icon>
      </el-button>
      <template #dropdown>
        <el-dropdown-menu>
          <div class="wall-dropdown-header">
            <span>選擇祝福牆</span>
          </div>
          <el-dropdown-item 
            v-for="wall in walls" 
            :key="wall.id"
            :command="wall.id"
            :class="{ 'is-active': wall.id === currentWallId }"
          >
            <div class="wall-item">
              <div class="wall-info">
                <span class="wall-name">{{ wall.name }}</span>
                <span class="wall-mode">{{ wall.isPublic ? '公開' : '私人' }}</span>
              </div>
              <el-tag 
                :type="wall.isActive ? 'success' : 'info'" 
                size="small"
              >
                {{ wall.isActive ? '活躍' : '停用' }}
              </el-tag>
            </div>
          </el-dropdown-item>
          <el-dropdown-item divided command="create-new">
            <div class="create-wall-item">
              <el-icon><Plus /></el-icon>
              <span>創建新祝福牆</span>
            </div>
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup>
import { Grid, ArrowDown, Plus } from '@element-plus/icons-vue'
import { useWallsStore } from '~/stores/walls'
import { useAuthStore } from '~/stores/auth'

const props = defineProps({
  currentWallId: {
    type: String,
    required: true
  },
  walls: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['wall-changed', 'create-wall'])

const router = useRouter()
const wallsStore = useWallsStore()
const authStore = useAuthStore()

// 當前牆名稱
const currentWallName = computed(() => {
  const currentWall = props.walls.find(w => w.id === props.currentWallId)
  return currentWall ? currentWall.name : '選擇祝福牆'
})


// 處理牆切換
const handleWallChange = (wallId) => {
  if (wallId === 'create-new') {
    emit('create-wall')
    return
  }
  
  if (wallId !== props.currentWallId) {
    // 切換到新的牆
    wallsStore.switchWall(wallId)
    router.push(`/${authStore.userId}/walls/${wallId}`)
    emit('wall-changed', wallId)
  }
}
</script>

<style scoped>
.wall-switcher {
  display: inline-block;
}

.switcher-button {
  border-radius: 25px;
  padding: 10px 20px;
  font-weight: 600;
  box-shadow: 0 4px 15px rgba(64, 158, 255, 0.3);
  transition: all 0.3s ease;
}

.switcher-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(64, 158, 255, 0.4);
}

.wall-dropdown-header {
  padding: 8px 16px;
  font-weight: 600;
  color: #666;
  border-bottom: 1px solid #eee;
  background: #f8f9fa;
}

.wall-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-width: 250px;
}

.wall-info {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.wall-name {
  font-weight: 600;
  color: #333;
  margin-bottom: 2px;
}

.wall-mode {
  font-size: 12px;
  color: #999;
}

.create-wall-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #409EFF;
  font-weight: 600;
}

.el-dropdown-item.is-active {
  background-color: #f0f9ff;
  color: #409EFF;
}

.el-dropdown-item.is-active .wall-name {
  color: #409EFF;
}
</style>