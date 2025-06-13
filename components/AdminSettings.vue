<template>
  <div class="admin-settings">
    <el-card shadow="hover">
      <template #header>
        <div class="settings-header">
          <el-icon size="20"><Setting /></el-icon>
          <span>留言審核設定</span>
        </div>
      </template>
      
      <div class="settings-content">
        <el-form :model="settings" label-width="140px">
          <el-form-item label="預設審核模式">
            <el-radio-group v-model="settings.defaultApproval">
              <el-radio label="pending">需要審核</el-radio>
              <el-radio label="approved">自動通過</el-radio>
            </el-radio-group>
            <div class="form-help">
              設定新留言的預設審核狀態
            </div>
          </el-form-item>
          
          <el-form-item label="顯示未審核留言">
            <el-switch 
              v-model="settings.showUnmoderated"
              active-text="顯示"
              inactive-text="隱藏"
            />
            <div class="form-help">
              是否在祝福牆上顯示待審核的留言
            </div>
          </el-form-item>
          
          <el-form-item label="自動審核關鍵字">
            <el-input 
              v-model="settings.autoApproveKeywords"
              placeholder="輸入關鍵字，用逗號分隔"
              type="textarea"
              :rows="3"
            />
            <div class="form-help">
              包含這些關鍵字的留言將自動通過審核
            </div>
          </el-form-item>
          
          <el-form-item label="自動拒絕關鍵字">
            <el-input 
              v-model="settings.autoRejectKeywords"
              placeholder="輸入關鍵字，用逗號分隔"
              type="textarea"
              :rows="3"
            />
            <div class="form-help">
              包含這些關鍵字的留言將自動被拒絕
            </div>
          </el-form-item>
        </el-form>
        
        <div class="action-buttons">
          <el-button type="primary" @click="saveSettings">
            <el-icon><Check /></el-icon>
            儲存設定
          </el-button>
          
          <el-button @click="resetSettings">
            <el-icon><RefreshRight /></el-icon>
            重置為預設值
          </el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { Setting, Check, RefreshRight } from '@element-plus/icons-vue'

// 設定項目
const settings = ref({
  defaultApproval: 'pending',
  showUnmoderated: false,
  autoApproveKeywords: '',
  autoRejectKeywords: ''
})

// 載入設定
const loadSettings = () => {
  try {
    const saved = localStorage.getItem('moderationSettings')
    if (saved) {
      settings.value = { ...settings.value, ...JSON.parse(saved) }
    }
  } catch (error) {
    console.error('載入審核設定失敗:', error)
  }
}

// 儲存設定
const saveSettings = () => {
  try {
    localStorage.setItem('moderationSettings', JSON.stringify(settings.value))
    
    // 觸發設定更新事件
    window.dispatchEvent(new CustomEvent('moderationSettingsUpdated', {
      detail: settings.value
    }))
    
    ElMessage.success('審核設定已儲存')
  } catch (error) {
    ElMessage.error('儲存設定失敗')
    console.error('儲存審核設定失敗:', error)
  }
}

// 重置設定
const resetSettings = () => {
  settings.value = {
    defaultApproval: 'pending',
    showUnmoderated: false,
    autoApproveKeywords: '',
    autoRejectKeywords: ''
  }
  ElMessage.info('設定已重置')
}

// 初始化
onMounted(() => {
  loadSettings()
})
</script>

<style scoped>
.admin-settings {
  margin-bottom: 30px;
}

.settings-header {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  color: #2c3e50;
}

.settings-content {
  padding: 20px 0;
}

.form-help {
  font-size: 12px;
  color: #7f8c8d;
  margin-top: 5px;
  line-height: 1.4;
}

.action-buttons {
  display: flex;
  gap: 15px;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #ecf0f1;
}

.el-form-item {
  margin-bottom: 25px;
}
</style>