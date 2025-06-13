<template>
  <div class="admin-page">
    <!-- 頁面標題 -->
    <div class="page-header">
      <h1>
        <el-icon size="24"><Tools /></el-icon>
        管理員控制台
      </h1>
      <div class="header-actions">
        <el-button @click="navigateTo('/')">
          <el-icon><ArrowLeft /></el-icon>
          返回首頁
        </el-button>
      </div>
    </div>

    <!-- 統計卡片 -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">
          <el-icon size="32" color="#409EFF"><MessageBox /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ totalMessages }}</div>
          <div class="stat-label">總留言數</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">
          <el-icon size="32" color="#67C23A"><Select /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ approvedMessages }}</div>
          <div class="stat-label">已審核</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">
          <el-icon size="32" color="#F56C6C"><Clock /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ pendingMessages }}</div>
          <div class="stat-label">待審核</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">
          <el-icon size="32" color="#E6A23C"><Picture /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ messagesWithPhoto }}</div>
          <div class="stat-label">含照片</div>
        </div>
      </div>
    </div>

    <!-- 操作面板 -->
    <div class="action-panel">
      <el-card shadow="hover">
        <template #header>
          <div class="card-header">
            <span>快速操作</span>
          </div>
        </template>
        
        <div class="action-buttons">
          <el-button 
            type="success" 
            @click="approveAll"
            :disabled="pendingMessages === 0"
          >
            <el-icon><Check /></el-icon>
            批量審核通過
          </el-button>
          
          <el-button 
            type="warning" 
            @click="refreshMessages"
            :loading="loading"
          >
            <el-icon><Refresh /></el-icon>
            重新整理
          </el-button>
          
          <el-button 
            type="info" 
            @click="showSettings = true"
          >
            <el-icon><Setting /></el-icon>
            系統設定
          </el-button>
        </div>
      </el-card>
    </div>

    <!-- 留言管理表格 -->
    <div class="messages-table">
      <el-card shadow="hover">
        <template #header>
          <div class="card-header">
            <span>留言管理</span>
            <div class="header-filters">
              <el-select v-model="filterStatus" placeholder="篩選狀態" clearable>
                <el-option label="全部" value="all" />
                <el-option label="已審核" value="approved" />
                <el-option label="待審核" value="pending" />
                <el-option label="已拒絕" value="rejected" />
              </el-select>
            </div>
          </div>
        </template>
        
        <el-table 
          :data="filteredMessages" 
          v-loading="loading"
          stripe
          style="width: 100%"
          @sort-change="handleSortChange"
        >
          <el-table-column prop="name" label="姓名" width="120" />
          
          <el-table-column prop="text" label="留言內容" min-width="200">
            <template #default="scope">
              <div class="message-text">{{ scope.row.text }}</div>
            </template>
          </el-table-column>
          
          <el-table-column label="照片" width="80" align="center">
            <template #default="scope">
              <el-avatar 
                v-if="scope.row.photo" 
                :src="scope.row.photo" 
                size="small"
                @click="previewImage(scope.row.photo)"
                style="cursor: pointer"
              />
              <span v-else class="no-photo">無</span>
            </template>
          </el-table-column>
          
          <el-table-column prop="timestamp" label="時間" width="120" sortable="custom">
            <template #default="scope">
              <div class="timestamp">{{ formatTime(scope.row.timestamp) }}</div>
            </template>
          </el-table-column>
          
          <el-table-column label="狀態" width="100" align="center">
            <template #default="scope">
              <el-tag 
                :type="getStatusType(scope.row.approved)"
                size="small"
              >
                {{ getStatusText(scope.row.approved) }}
              </el-tag>
            </template>
          </el-table-column>
          
          <el-table-column label="操作" width="200" align="center">
            <template #default="scope">
              <div class="action-buttons">
                <el-button 
                  v-if="scope.row.approved !== 'approved'"
                  type="success" 
                  size="small"
                  @click="approveMessage(scope.row)"
                >
                  <el-icon><Check /></el-icon>
                  通過
                </el-button>
                
                <el-button 
                  v-if="scope.row.approved !== 'rejected'"
                  type="danger" 
                  size="small"
                  @click="rejectMessage(scope.row)"
                >
                  <el-icon><Close /></el-icon>
                  拒絕
                </el-button>
                
                <el-button 
                  type="info" 
                  size="small"
                  @click="viewDetails(scope.row)"
                >
                  <el-icon><View /></el-icon>
                  詳情
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>

    <!-- 系統設定對話框 -->
    <el-dialog 
      v-model="showSettings" 
      title="系統設定" 
      width="700px"
    >
      <div class="settings-content">
        <h3>祝福牆背景設定</h3>
        <div class="background-upload-section">
          <div class="current-background" v-if="currentBackground">
            <label class="form-label">目前背景：</label>
            <div class="preview-container">
              <img :src="currentBackground" alt="目前背景" class="background-preview" :key="currentBackground" />
              <div class="preview-overlay">
                <el-button 
                  type="danger" 
                  size="small" 
                  @click="removeBackground"
                  :loading="removing"
                >
                  移除背景
                </el-button>
              </div>
            </div>
          </div>
          
          <div class="upload-section">
            <div v-if="currentBackground" class="upload-disabled">
              <div class="upload-area disabled">
                <el-icon size="32" color="#C0C4CC">
                  <Upload />
                </el-icon>
                <p>已有背景圖片</p>
                <p class="upload-tip warning">請先移除舊背景才能上傳新背景</p>
              </div>
            </div>
            
            <el-upload
              v-else
              class="background-uploader"
              :on-change="onFileChange"
              :on-remove="onFileRemove"
              :auto-upload="false"
              :accept="'image/*'"
              :limit="1"
              :show-file-list="false"
            >
              <div class="upload-area">
                <el-icon size="32" color="#C0C4CC">
                  <Upload />
                </el-icon>
                <p>點擊上傳背景圖片</p>
                <p class="upload-tip">建議尺寸: 1920x1080 或更高</p>
              </div>
            </el-upload>
            
            <div v-if="selectedFile" class="file-preview">
              <img :src="previewUrl" alt="預覽" class="preview-image" />
              <div class="file-info">
                <p><strong>{{ selectedFile.name }}</strong></p>
                <p>{{ formatFileSize(selectedFile.size) }}</p>
              </div>
              <div class="upload-actions">
                <el-button 
                  type="primary" 
                  size="small"
                  @click="uploadBackground"
                  :loading="uploading"
                  :disabled="uploading"
                >
                  {{ uploading ? '上傳中...' : '設定為背景' }}
                </el-button>
                <el-button size="small" @click="cancelUpload">取消</el-button>
              </div>
            </div>
          </div>
        </div>
        
        <h3>祝福牆標題設定</h3>
        <el-form :model="settings" label-width="140px">
          <el-form-item label="祝福牆標題">
            <el-input 
              v-model="settings.wallTitle" 
              placeholder="輸入祝福牆標題"
              maxlength="30"
              show-word-limit
            />
          </el-form-item>
          
          <el-form-item label="副標題">
            <el-input 
              v-model="settings.wallSubtitle" 
              placeholder="輸入副標題（選填）"
              maxlength="50"
              show-word-limit
            />
          </el-form-item>
          
          <el-form-item label="標題顏色">
            <el-color-picker v-model="settings.titleColor" />
          </el-form-item>
        </el-form>
        
        <div class="preview-section">
          <div class="preview-label">預覽效果</div>
          <div class="preview-box">
            <h2 :style="{ color: settings.titleColor }">{{ settings.wallTitle || '婚禮祝福牆' }}</h2>
            <p v-if="settings.wallSubtitle" :style="{ color: settings.titleColor, opacity: 0.8 }">{{ settings.wallSubtitle }}</p>
          </div>
        </div>
        
        <h3>祝福牆顯示設定</h3>
        <el-form :model="settings" label-width="140px">
          <el-form-item label="自動播放延遲">
            <el-input-number 
              v-model="settings.autoplayDelay" 
              :min="1" 
              :max="30"
              :step="1"
            />
            <span class="form-help">秒</span>
            <div class="form-help">調整祝福訊息在牆上的顯示時間</div>
          </el-form-item>
          
          <el-form-item label="圖片額外時間">
            <el-input-number 
              v-model="settings.imageDelay" 
              :min="0" 
              :max="10"
              :step="0.5"
            />
            <span class="form-help">秒</span>
            <div class="form-help">有圖片的留言額外停留時間</div>
          </el-form-item>
        </el-form>
        
        <h3>審核設定</h3>
        <el-form :model="settings" label-width="140px">
          <el-form-item label="自動審核">
            <el-switch 
              v-model="settings.autoApprove"
              active-text="開啟"
              inactive-text="關閉"
            />
            <div class="form-help">開啟後，新留言將自動通過審核並顯示在祝福牆上</div>
          </el-form-item>
          
          <el-form-item label="顯示未審核">
            <el-switch 
              v-model="settings.showUnmoderated"
              active-text="顯示"
              inactive-text="隱藏"
            />
            <div class="form-help">開啟後，祝福牆將同時顯示待審核的留言（橘色標示）</div>
          </el-form-item>
          
          <el-form-item label="自動通過關鍵字">
            <el-input 
              v-model="settings.autoApproveKeywords"
              placeholder="例如：祝福,恭喜,幸福"
              type="textarea"
              :rows="2"
            />
            <div class="form-help">包含這些關鍵字的留言將自動通過審核（用逗號分隔）</div>
          </el-form-item>
          
          <el-form-item label="自動拒絕關鍵字">
            <el-input 
              v-model="settings.autoRejectKeywords"
              placeholder="例如：廣告,垃圾,不當"
              type="textarea"
              :rows="2"
            />
            <div class="form-help">包含這些關鍵字的留言將自動被拒絕（用逗號分隔）</div>
          </el-form-item>
        </el-form>
      </div>
      
      <template #footer>
        <el-button @click="showSettings = false">取消</el-button>
        <el-button type="primary" @click="saveSettings">儲存</el-button>
      </template>
    </el-dialog>

    <!-- 留言詳情對話框 -->
    <el-dialog 
      v-model="showDetails" 
      title="留言詳情" 
      width="500px"
    >
      <div v-if="selectedMessage" class="message-details">
        <div class="detail-row">
          <label>姓名：</label>
          <span>{{ selectedMessage.name }}</span>
        </div>
        
        <div class="detail-row">
          <label>留言內容：</label>
          <div class="message-content">{{ selectedMessage.text }}</div>
        </div>
        
        <div class="detail-row" v-if="selectedMessage.photo">
          <label>照片：</label>
          <el-image 
            :src="selectedMessage.photo" 
            style="width: 200px; height: 200px"
            fit="cover"
            :preview-src-list="[selectedMessage.photo]"
          />
        </div>
        
        <div class="detail-row">
          <label>提交時間：</label>
          <span>{{ formatFullTime(selectedMessage.timestamp) }}</span>
        </div>
        
        <div class="detail-row">
          <label>審核狀態：</label>
          <el-tag :type="getStatusType(selectedMessage.approved)">
            {{ getStatusText(selectedMessage.approved) }}
          </el-tag>
        </div>
      </div>
    </el-dialog>

    <!-- 圖片預覽對話框 -->
    <el-dialog 
      v-model="showImagePreview" 
      title="圖片預覽"
      width="80%"
      center
    >
      <div class="image-preview">
        <el-image 
          :src="previewImageUrl" 
          style="width: 100%; max-height: 70vh"
          fit="contain"
        />
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { 
  Tools, 
  ArrowLeft, 
  MessageBox, 
  Select, 
  Clock, 
  Picture, 
  Check, 
  Refresh, 
  Setting,
  Close,
  View,
  Upload
} from '@element-plus/icons-vue'

// 介面定義
interface MessageData {
  name: string
  text: string
  photo: string
  timestamp?: number
  approved?: 'approved' | 'pending' | 'rejected'
}

// 響應式資料
const messages = ref<MessageData[]>([])
const loading = ref(false)
const showSettings = ref(false)
const showDetails = ref(false)
const showImagePreview = ref(false)
const selectedMessage = ref<MessageData | null>(null)
const previewImageUrl = ref('')
const filterStatus = ref('all')

// 背景上傳相關
const selectedFile = ref<File | null>(null)
const previewUrl = ref('')

// 設定項目
const settings = ref({
  wallTitle: '婚禮祝福牆',
  wallSubtitle: '',
  titleColor: '#2c3e50',
  autoplayDelay: 3,
  imageDelay: 1,
  autoApprove: false,
  showUnmoderated: false
})

// 計算屬性
const totalMessages = computed(() => messages.value.length)
const approvedMessages = computed(() => 
  messages.value.filter(m => m.approved === 'approved').length
)
const pendingMessages = computed(() => 
  messages.value.filter(m => m.approved === 'pending' || !m.approved).length
)
const messagesWithPhoto = computed(() => 
  messages.value.filter(m => m.photo).length
)

// 使用 Pinia Stores
const backgroundStore = useBackgroundStore()
const uploadStore = useUploadStore()
const uiStore = useUIStore()

// 背景相關計算屬性
const currentBackground = computed(() => {
  return backgroundStore.cachedBackgroundUrl
})
const uploading = computed(() => uploadStore.isUploading)
const removing = computed(() => backgroundStore.isLoading)

// 使用 minio 工具
const { formatFileSize } = useMinio()

const filteredMessages = computed(() => {
  if (filterStatus.value === 'all') return messages.value
  if (filterStatus.value === 'approved') return messages.value.filter(m => m.approved === 'approved')
  if (filterStatus.value === 'pending') return messages.value.filter(m => m.approved === 'pending' || !m.approved)
  if (filterStatus.value === 'rejected') return messages.value.filter(m => m.approved === 'rejected')
  return messages.value
})

// 載入留言
const loadMessages = async () => {
  loading.value = true
  try {
    const response = await fetch('/api/admin/messages')
    if (response.ok) {
      const data = await response.json()
      messages.value = data.messages || []
    } else {
      throw new Error('載入失敗')
    }
  } catch (error) {
    ElMessage.error('載入留言失敗')
    console.error('載入留言錯誤:', error)
  } finally {
    loading.value = false
  }
}

// 審核留言
const approveMessage = async (message: MessageData) => {
  try {
    const response = await fetch('/api/admin/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        timestamp: message.timestamp,
        approved: 'approved'
      })
    })
    
    if (response.ok) {
      message.approved = 'approved'
      ElMessage.success('審核通過')
    } else {
      throw new Error('審核失敗')
    }
  } catch (error) {
    ElMessage.error('審核失敗')
    console.error('審核錯誤:', error)
  }
}

// 拒絕留言
const rejectMessage = async (message: MessageData) => {
  try {
    const response = await fetch('/api/admin/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        timestamp: message.timestamp,
        approved: 'rejected'
      })
    })
    
    if (response.ok) {
      message.approved = 'rejected'
      ElMessage.success('已拒絕')
    } else {
      throw new Error('操作失敗')
    }
  } catch (error) {
    ElMessage.error('操作失敗')
    console.error('拒絕錯誤:', error)
  }
}

// 批量審核
const approveAll = async () => {
  try {
    const pendingList = messages.value.filter(m => m.approved !== 'approved')
    for (const message of pendingList) {
      await approveMessage(message)
    }
    ElMessage.success(`已批量審核 ${pendingList.length} 則留言`)
  } catch (error) {
    ElMessage.error('批量審核失敗')
  }
}

// 重新整理
const refreshMessages = () => {
  loadMessages()
}

// 儲存設定
const saveSettings = async () => {
  try {
    // 儲存到伺服器端
    const response = await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ settings: settings.value })
    })
    
    const result = await response.json()
    
    if (result.success) {
      // 同時儲存到 localStorage 以供客戶端快速存取
      localStorage.setItem('adminSettings', JSON.stringify(settings.value))
      localStorage.setItem('wallSettings', JSON.stringify({
        autoplayDelay: settings.value.autoplayDelay,
        imageDelay: settings.value.imageDelay
      }))
      localStorage.setItem('wallTitleSettings', JSON.stringify({
        wallTitle: settings.value.wallTitle,
        wallSubtitle: settings.value.wallSubtitle,
        titleColor: settings.value.titleColor
      }))
      
      // 觸發設定更新事件
      window.dispatchEvent(new CustomEvent('wallSettingsUpdated', {
        detail: {
          autoplayDelay: settings.value.autoplayDelay,
          imageDelay: settings.value.imageDelay
        }
      }))
      
      window.dispatchEvent(new CustomEvent('wallTitleUpdated', {
        detail: {
          wallTitle: settings.value.wallTitle,
          wallSubtitle: settings.value.wallSubtitle,
          titleColor: settings.value.titleColor
        }
      }))
      
      showSettings.value = false
      ElMessage.success('設定已儲存')
      
      // 重新載入留言以反映新的審核設定
      await loadMessages()
    } else {
      throw new Error(result.error || '儲存失敗')
    }
  } catch (error) {
    console.error('儲存設定失敗:', error)
    ElMessage.error('儲存設定失敗')
  }
}

// 載入設定
const loadSettings = async () => {
  try {
    // 先從伺服器載入設定
    const response = await fetch('/api/admin/settings')
    const result = await response.json()
    
    if (result.success && result.settings) {
      settings.value = { ...settings.value, ...result.settings }
      
      // 同步更新 localStorage
      localStorage.setItem('adminSettings', JSON.stringify(result.settings))
      localStorage.setItem('wallSettings', JSON.stringify({
        autoplayDelay: result.settings.autoplayDelay,
        imageDelay: result.settings.imageDelay
      }))
      localStorage.setItem('wallTitleSettings', JSON.stringify({
        wallTitle: result.settings.wallTitle,
        wallSubtitle: result.settings.wallSubtitle,
        titleColor: result.settings.titleColor
      }))
    } else {
      // 伺服器載入失敗時，嘗試從 localStorage 載入
      const adminSettings = localStorage.getItem('adminSettings')
      if (adminSettings) {
        settings.value = { ...settings.value, ...JSON.parse(adminSettings) }
      }
      
      const titleSettings = localStorage.getItem('wallTitleSettings')
      if (titleSettings) {
        const parsed = JSON.parse(titleSettings)
        settings.value.wallTitle = parsed.wallTitle || '婚禮祝福牆'
        settings.value.wallSubtitle = parsed.wallSubtitle || ''
        settings.value.titleColor = parsed.titleColor || '#2c3e50'
      }
    }
  } catch (error) {
    console.error('載入設定失敗:', error)
    // 錯誤時從 localStorage 載入
    try {
      const adminSettings = localStorage.getItem('adminSettings')
      if (adminSettings) {
        settings.value = { ...settings.value, ...JSON.parse(adminSettings) }
      }
    } catch (localError) {
      console.error('從 localStorage 載入設定失敗:', localError)
    }
  }
}

// 背景上傳功能
const onFileChange = async (uploadFile: any) => {
  const file = uploadFile.raw
  
  // 檔案類型驗證
  if (!file.type.startsWith('image/')) {
    ElMessage.error('請選擇圖片檔案')
    return
  }
  
  // 檔案大小驗證 (10MB)
  const maxSize = 10 * 1024 * 1024
  if (file.size > maxSize) {
    ElMessage.error('檔案大小不能超過 10MB')
    return
  }
  
  selectedFile.value = file
  
  // 創建預覽
  const reader = new FileReader()
  reader.onload = (e) => {
    previewUrl.value = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

const onFileRemove = () => {
  selectedFile.value = null
  previewUrl.value = ''
}

const cancelUpload = () => {
  onFileRemove()
}

const uploadBackground = async () => {
  if (!selectedFile.value) return
  
  try {
    uploadStore.startUpload('background')
    await backgroundStore.uploadBackground(selectedFile.value)
    uploadStore.uploadSuccess(selectedFile.value.name)
    ElMessage.success('背景設定成功！')
    onFileRemove()
    await nextTick()
  } catch (error: any) {
    uploadStore.uploadFailed(error.message || '上傳失敗', selectedFile.value?.name)
    ElMessage.error('上傳失敗，請重試')
    console.error('上傳錯誤:', error)
  }
}

const removeBackground = async () => {
  try {
    await backgroundStore.removeBackground()
    ElMessage.success('背景已移除')
    await nextTick()
  } catch (error: any) {
    ElMessage.error('移除失敗，請重試')
    console.error('移除錯誤:', error)
  }
}

// 輔助函數
const getStatusType = (approved?: string) => {
  switch (approved) {
    case 'approved': return 'success'
    case 'rejected': return 'danger'
    default: return 'warning'
  }
}

const getStatusText = (approved?: string) => {
  switch (approved) {
    case 'approved': return '已審核'
    case 'rejected': return '已拒絕'
    default: return '待審核'
  }
}

const formatTime = (timestamp?: number) => {
  if (!timestamp) return '無'
  return new Date(timestamp).toLocaleDateString()
}

const formatFullTime = (timestamp?: number) => {
  if (!timestamp) return '無'
  return new Date(timestamp).toLocaleString()
}

const viewDetails = (message: MessageData) => {
  selectedMessage.value = message
  showDetails.value = true
}

const previewImage = (url: string) => {
  previewImageUrl.value = url
  showImagePreview.value = true
}

const handleSortChange = (column: any) => {
  if (column.prop === 'timestamp') {
    if (column.order === 'ascending') {
      messages.value.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0))
    } else {
      messages.value.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
    }
  }
}

// 頁面設定
useHead({
  title: '管理員控制台 - 婚禮祝福牆',
  meta: [
    { name: 'description', content: '管理員控制台，管理祝福留言和系統設定' }
  ]
})

// 初始化
onMounted(async () => {
  await loadSettings()
  await loadMessages()
  backgroundStore.loadBackground(true)
})
</script>

<style scoped>
.admin-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  background: white;
  padding: 20px 30px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.page-header h1 {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0;
  color: #2c3e50;
  font-size: 24px;
  font-weight: 600;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 20px;
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-icon {
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 32px;
  font-weight: 700;
  color: #2c3e50;
  line-height: 1;
}

.stat-label {
  font-size: 14px;
  color: #7f8c8d;
  margin-top: 5px;
}

.action-panel {
  margin-bottom: 30px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  color: #2c3e50;
}

.header-filters {
  display: flex;
  gap: 10px;
}

.action-buttons {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.messages-table {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.message-text {
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.no-photo {
  color: #bdc3c7;
  font-size: 12px;
}

.timestamp {
  font-size: 12px;
  color: #7f8c8d;
}

.settings-content {
  padding: 20px 0;
}

.settings-content h3 {
  color: #2c3e50;
  margin: 20px 0 15px 0;
  padding-bottom: 10px;
  border-bottom: 2px solid #ecf0f1;
}

.form-help {
  margin-left: 10px;
  color: #7f8c8d;
  font-size: 12px;
}

.preview-section {
  margin: 20px 0;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 8px;
}

.preview-label {
  font-weight: 500;
  color: #606266;
  margin-bottom: 10px;
  font-size: 14px;
}

.preview-box {
  text-align: center;
  padding: 20px;
  background: white;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.preview-box h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: bold;
}

.preview-box p {
  margin: 0;
  font-size: 16px;
}

/* 背景上傳樣式 */
.background-upload-section {
  margin: 20px 0;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 8px;
}

.form-label {
  display: block;
  margin-bottom: 10px;
  font-weight: 500;
  color: #606266;
  font-size: 14px;
}

.preview-container {
  position: relative;
  display: inline-block;
  margin-bottom: 15px;
}

.background-preview {
  width: 150px;
  height: 84px;
  object-fit: cover;
  border-radius: 6px;
  border: 2px solid #e4e7ed;
}

.preview-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.preview-container:hover .preview-overlay {
  opacity: 1;
}

.upload-area {
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  transition: border-color 0.3s ease;
  cursor: pointer;
  margin-bottom: 15px;
}

.upload-area:hover {
  border-color: #409EFF;
}

.upload-area.disabled {
  border-color: #dcdfe6;
  background: #f5f7fa;
  cursor: not-allowed;
}

.upload-area.disabled:hover {
  border-color: #dcdfe6;
}

.upload-area p {
  margin: 8px 0;
  color: #606266;
  font-size: 14px;
}

.upload-area.disabled p {
  color: #c0c4cc;
}

.upload-tip {
  font-size: 12px;
  color: #909399;
}

.upload-tip.warning {
  color: #e6a23c;
  font-weight: 500;
}

.file-preview {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  background: white;
}

.preview-image {
  width: 60px;
  height: 34px;
  object-fit: cover;
  border-radius: 4px;
}

.file-info {
  flex: 1;
}

.file-info p {
  margin: 2px 0;
  color: #606266;
  font-size: 13px;
}

.upload-actions {
  display: flex;
  gap: 8px;
}

.message-details {
  padding: 20px 0;
}

.detail-row {
  display: flex;
  margin-bottom: 15px;
  align-items: flex-start;
}

.detail-row label {
  font-weight: 600;
  color: #2c3e50;
  min-width: 100px;
  margin-right: 15px;
}

.message-content {
  flex: 1;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #3498db;
}

.image-preview {
  text-align: center;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .admin-page {
    padding: 10px;
  }
  
  .page-header {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    justify-content: center;
  }
  
  .card-header {
    flex-direction: column;
    gap: 10px;
  }
}
</style>