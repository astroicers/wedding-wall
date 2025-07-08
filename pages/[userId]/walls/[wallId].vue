<template>
  <div v-if="wall" class="wall-page">
    <!-- 導航欄 -->
    <div class="navigation-bar">
      <div class="nav-left">
        <el-button 
          @click="navigateToWallsList" 
          :icon="ArrowLeft" 
          type="primary" 
          plain
          class="back-button"
        >
          返回墻列表
        </el-button>
      </div>
      
      <div class="nav-center">
        <WallSwitcher 
          :current-wall-id="wallId"
          :walls="allWalls"
          @wall-changed="handleWallChange"
          @create-wall="showCreateWallDialog = true"
        />
      </div>
      
      <div class="nav-right">
        <el-tag :type="wall.isActive ? 'success' : 'info'">
          {{ wall.isActive ? '活躍' : '未啟用' }}
        </el-tag>
      </div>
    </div>

    <!-- 主標題區域 -->
    <div class="hero-section">
      <div class="hero-content">
        <div class="hero-title">
          <h1 class="main-title">🎊 {{ wall.name }}</h1>
          <p class="subtitle">分享美好瞬間，留下永恆祝福</p>
        </div>
        <div class="hero-actions">
          <el-button 
            type="primary" 
            size="large" 
            @click="navigateToUpload" 
            class="primary-btn"
          >
            <el-icon><Upload /></el-icon>
            立即上傳祝福
          </el-button>
          <el-button 
            size="large" 
            @click="navigateToGallery" 
            class="secondary-btn"
          >
            <el-icon><Picture /></el-icon>
            觀看相簿
          </el-button>
          <el-button 
            size="large" 
            @click="viewPublicWall" 
            class="secondary-btn"
          >
            <el-icon><Monitor /></el-icon>
            全螢幕播放
          </el-button>
        </div>
      </div>
    </div>

    <!-- 主要功能卡片 -->
    <div class="main-features">
      <div class="section-header">
        <h2>功能選單</h2>
        <p>多種操作方式，管理您的祝福牆</p>
      </div>
      
      <div class="feature-grid">
        <div class="feature-card primary" @click="showDisplayModeDialog = true">
          <div class="card-icon">
            <el-icon size="40"><Grid /></el-icon>
          </div>
          <div class="card-content">
            <h3>觀看祝福牆</h3>
            <p>{{ getDisplayModeText(wall.settings.displayMode) }}風格展示</p>
          </div>
          <div class="card-arrow">
            <el-icon><ArrowRight /></el-icon>
          </div>
        </div>

        <div class="feature-card featured" @click="navigateToGallery">
          <div class="card-badge">HOT</div>
          <div class="card-icon">
            <el-icon size="40"><PhotoIcon /></el-icon>
          </div>
          <div class="card-content">
            <h3>相簿展示</h3>
            <p>瀏覽所有珍貴回憶</p>
          </div>
          <div class="card-arrow">
            <el-icon><ArrowRight /></el-icon>
          </div>
        </div>

        <div class="feature-card" @click="showExportDialog = true">
          <div class="card-icon">
            <el-icon size="40"><Download /></el-icon>
          </div>
          <div class="card-content">
            <h3>匯出資料</h3>
            <p>下載祝福訊息與圖片</p>
          </div>
          <div class="card-arrow">
            <el-icon><ArrowRight /></el-icon>
          </div>
        </div>

        <div class="feature-card admin" @click="showAdminPanel = true">
          <div class="card-badge admin-badge">ADMIN</div>
          <div class="card-icon">
            <el-icon size="40"><Tools /></el-icon>
          </div>
          <div class="card-content">
            <h3>管理控制台</h3>
            <p>留言審核與系統設定</p>
          </div>
          <div class="card-arrow">
            <el-icon><ArrowRight /></el-icon>
          </div>
        </div>
      </div>
    </div>


    <!-- 使用指南 -->
    <div class="guide-section">
      <div class="section-header">
        <h2>使用指南</h2>
        <p>三步驟輕鬆留下美好祝福</p>
      </div>
      
      <div class="guide-steps">
        <div class="step-item">
          <div class="step-number">1</div>
          <div class="step-content">
            <h4>上傳照片</h4>
            <p>選擇一張美好的照片</p>
          </div>
        </div>
        <div class="step-divider">
          <el-icon><ArrowRight /></el-icon>
        </div>
        <div class="step-item">
          <div class="step-number">2</div>
          <div class="step-content">
            <h4>填寫祝福</h4>
            <p>留下真誠的祝福文字</p>
          </div>
        </div>
        <div class="step-divider">
          <el-icon><ArrowRight /></el-icon>
        </div>
        <div class="step-item">
          <div class="step-number">3</div>
          <div class="step-content">
            <h4>即時展示</h4>
            <p>在祝福牆上看到您的祝福</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Settings Dialog -->
    <el-dialog
      v-model="showSettings"
      title="牆設置"
      width="500px"
    >
      <el-form :model="wall.settings" label-width="120px">
        
        <el-form-item label="牆 ID">
          <el-input :value="wall.id" readonly>
            <template #append>
              <el-button @click="copyWallId">複製</el-button>
            </template>
          </el-input>
        </el-form-item>
        
        <el-form-item label="分享連結">
          <el-input :value="shareUrl" readonly>
            <template #append>
              <el-button @click="copyShareUrl">複製</el-button>
            </template>
          </el-input>
        </el-form-item>
      </el-form>
    </el-dialog>


    <!-- Admin Panel Dialog -->
    <el-dialog
      v-model="showAdminPanel"
      title="管理控制台"
      width="80%"
      top="5vh"
      class="admin-dialog"
    >
      <el-tabs v-model="activeAdminTab">
        <el-tab-pane label="祝福管理" name="messages">
          <div class="admin-messages">
            <div class="admin-stats">
              <el-statistic title="總祝福數" :value="messages?.length || 0" />
              <el-statistic title="今日新增" :value="getTodayMessagesCount()" />
            </div>
            
            <el-table :data="messages || []" style="width: 100%; margin-top: 20px;">
              <el-table-column prop="name" label="姓名" width="120" />
              <el-table-column prop="message" label="祝福內容" show-overflow-tooltip />
              <el-table-column prop="createdAt" label="上傳時間" width="180">
                <template #default="scope">
                  {{ formatFullDate(scope.row.createdAt) }}
                </template>
              </el-table-column>
              <el-table-column prop="status" label="狀態" width="100">
                <template #default="scope">
                  <el-tag 
                    :type="scope.row.status === 'approved' ? 'success' : scope.row.status === 'rejected' ? 'danger' : 'warning'"
                  >
                    {{ scope.row.status === 'approved' ? '已通過' : scope.row.status === 'rejected' ? '已拒絕' : '待審核' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="200">
                <template #default="scope">
                  <el-button 
                    size="small" 
                    type="primary" 
                    @click="previewMessage(scope.row)"
                  >
                    預覽
                  </el-button>
                  <el-button 
                    v-if="scope.row.status !== 'approved'"
                    size="small" 
                    type="success" 
                    @click="approveMessage(scope.row)"
                  >
                    通過
                  </el-button>
                  <el-button 
                    v-if="scope.row.status !== 'rejected'"
                    size="small" 
                    type="danger" 
                    @click="rejectMessage(scope.row)"
                  >
                    拒絕
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="牆設置" name="settings">
          <el-form :model="wall.settings" label-width="120px">
            <el-form-item label="牆名稱">
              <el-input v-model="wall.name" />
            </el-form-item>
            
            <el-divider content-position="left">背景設定</el-divider>
            
            <el-form-item label="背景圖片">
              <div class="background-upload-section">
                <div v-if="currentBackgroundImage" class="current-background">
                  <div class="background-preview-container">
                    <img :src="currentBackgroundImage" alt="目前背景" class="background-preview" />
                    <div class="background-overlay">
                      <el-button 
                        type="danger" 
                        size="small" 
                        @click="removeBackgroundImage"
                        :loading="removingBackground"
                      >
                        移除背景
                      </el-button>
                    </div>
                  </div>
                  <div class="background-info">
                    <p class="background-label">目前背景圖片</p>
                  </div>
                </div>
                
                <div v-else class="no-background">
                  <el-upload
                    class="background-uploader"
                    :on-change="onBackgroundFileChange"
                    :auto-upload="false"
                    :accept="'image/*'"
                    :limit="1"
                    :show-file-list="false"
                  >
                    <div class="upload-area">
                      <el-icon size="32" color="#C0C4CC">
                        <Picture />
                      </el-icon>
                      <p>點擊上傳背景圖片</p>
                      <p class="upload-tip">建議尺寸: 1920x1080，支援 JPG、PNG</p>
                    </div>
                  </el-upload>
                </div>
                
                <div v-if="selectedBackgroundFile" class="background-file-preview">
                  <img :src="backgroundPreviewUrl" alt="預覽" class="preview-image" />
                  <div class="file-info">
                    <p><strong>{{ selectedBackgroundFile.name }}</strong></p>
                    <p>{{ formatFileSize(selectedBackgroundFile.size) }}</p>
                  </div>
                  <div class="upload-actions">
                    <el-button 
                      type="primary" 
                      @click="uploadBackgroundImage"
                      :loading="uploadingBackground"
                      size="small"
                    >
                      {{ uploadingBackground ? '上傳中...' : '設定為背景' }}
                    </el-button>
                    <el-button @click="cancelBackgroundUpload" size="small">取消</el-button>
                  </div>
                </div>
              </div>
              <div class="form-tip">背景圖片會顯示在所有祝福墻模式中</div>
            </el-form-item>
            
            <el-form-item label="顯示模式">
              <el-select v-model="wall.settings.displayMode">
                <el-option label="經典" value="default" />
                <el-option label="網格" value="grid" />
                <el-option label="拍立得" value="polaroid" />
                <el-option label="雜誌" value="magazine" />
                <el-option label="故事" value="stories" />
                <el-option label="增強" value="enhanced" />
              </el-select>
            </el-form-item>
            
            <el-form-item label="牆狀態">
              <el-switch 
                v-model="wall.isActive"
                active-text="啟用"
                inactive-text="停用"
              />
            </el-form-item>
            
            <el-divider content-position="left">審核設定</el-divider>
            
            <el-form-item label="自動審核">
              <el-switch 
                v-model="wall.settings.autoApprove"
                active-text="自動通過"
                inactive-text="需要審核"
              />
              <div class="form-tip">開啟後新留言將自動顯示，關閉後需要手動審核</div>
            </el-form-item>
            
            <el-form-item label="顯示未審核留言">
              <el-switch 
                v-model="wall.settings.showUnmoderated"
                active-text="顯示"
                inactive-text="隱藏"
              />
              <div class="form-tip">開啟後訪客可以看到待審核的留言</div>
            </el-form-item>
            
            <el-form-item label="自動通過關鍵字">
              <el-input 
                v-model="wall.settings.autoApproveKeywords"
                type="textarea"
                :rows="2"
                placeholder="包含這些關鍵字的留言將自動通過，用逗號分隔"
              />
            </el-form-item>
            
            <el-form-item label="自動拒絕關鍵字">
              <el-input 
                v-model="wall.settings.autoRejectKeywords"
                type="textarea"
                :rows="2"
                placeholder="包含這些關鍵字的留言將自動拒絕，用逗號分隔"
              />
            </el-form-item>
            
            <el-divider content-position="left">播放設定</el-divider>
            
            <el-form-item label="切換時間">
              <div class="time-setting-group">
                <el-slider 
                  v-model="wall.settings.autoplayDelay" 
                  :min="2" 
                  :max="15" 
                  :step="1"
                  show-stops
                  style="flex: 1;"
                />
                <span class="time-value">{{ wall.settings.autoplayDelay || 4 }} 秒</span>
              </div>
              <div class="form-tip">控制留言在祝福墻上的顯示時間</div>
            </el-form-item>
            
            <el-form-item label="圖片額外時間">
              <div class="time-setting-group">
                <el-slider 
                  v-model="wall.settings.imageExtraDelay" 
                  :min="0" 
                  :max="5" 
                  :step="0.5"
                  show-stops
                  style="flex: 1;"
                />
                <span class="time-value">+{{ wall.settings.imageExtraDelay || 1 }} 秒</span>
              </div>
              <div class="form-tip">有照片的留言會額外增加顯示時間</div>
            </el-form-item>
            
            <el-divider content-position="left">外觀設定</el-divider>
            
            <el-form-item label="墻標題">
              <el-input 
                v-model="wall.settings.wallTitle" 
                placeholder="自定義祝福墻標題（留空使用墻名稱）"
              />
              <div class="form-tip">此標題會顯示在所有祝福墻顯示模式中</div>
            </el-form-item>
            
            <el-form-item label="墻副標題">
              <el-input 
                v-model="wall.settings.wallSubtitle" 
                placeholder="可選的副標題或描述"
              />
            </el-form-item>
            
            <el-form-item label="背景顏色">
              <el-color-picker v-model="wall.settings.backgroundColor" />
            </el-form-item>
            
            <el-form-item label="文字顏色">
              <el-color-picker v-model="wall.settings.textColor" />
            </el-form-item>
            
            <el-form-item label="字體大小">
              <div class="time-setting-group">
                <el-slider 
                  v-model="wall.settings.fontSize" 
                  :min="24" 
                  :max="72" 
                  :step="4"
                  show-stops
                  style="flex: 1;"
                />
                <span class="time-value">{{ wall.settings.fontSize || 48 }}px</span>
              </div>
            </el-form-item>
            
            <el-form-item label="字體">
              <el-select v-model="wall.settings.fontFamily" placeholder="選擇字體">
                <el-option label="預設字體" value="Inter, sans-serif" />
                <el-option label="微軟正黑體" value="Microsoft JhengHei, sans-serif" />
                <el-option label="思源黑體" value="Noto Sans TC, sans-serif" />
                <el-option label="文泉驛正黑" value="WenQuanYi Zen Hei, sans-serif" />
              </el-select>
            </el-form-item>
            
            <el-form-item>
              <el-button type="primary" @click="saveWallSettings">保存設置</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>

    <!-- Export Dialog -->
    <el-dialog
      v-model="showExportDialog"
      title="匯出資料"
      width="500px"
    >
      <div class="export-options">
        <el-card class="export-card">
          <template #header>
            <span>匯出祝福訊息</span>
          </template>
          <p>將所有祝福訊息匯出為 CSV 檔案</p>
          <el-button type="primary" @click="exportMessages">
            <el-icon><Download /></el-icon>
            匯出 CSV
          </el-button>
        </el-card>
        
        <el-card class="export-card">
          <template #header>
            <span>匯出圖片</span>
          </template>
          <p>將所有祝福圖片打包下載</p>
          <el-button type="success" @click="exportImages">
            <el-icon><Picture /></el-icon>
            匯出 ZIP
          </el-button>
        </el-card>
      </div>
    </el-dialog>
    <!-- Display Mode Dialog -->
    <el-dialog
      v-model="showDisplayModeDialog"
      title="選擇顯示模式"
      width="600px"
    >
      <div class="display-mode-grid">
        <div 
          v-for="mode in displayModes" 
          :key="mode.value"
          class="display-mode-card"
          :class="{ active: wall.settings.displayMode === mode.value }"
          @click="viewWallInMode(mode.value)"
        >
          <div class="mode-icon">
            <el-icon size="40"><component :is="mode.icon" /></el-icon>
          </div>
          <h4>{{ mode.label }}</h4>
          <p>{{ mode.description }}</p>
        </div>
      </div>
      
      <template #footer>
        <el-button @click="showDisplayModeDialog = false">取消</el-button>
        <el-button type="primary" @click="viewWallInMode(wall.settings.displayMode)">
          <el-icon><Monitor /></el-icon>
          全螢幕播放
        </el-button>
      </template>
    </el-dialog>

    <!-- Display Mode Selection Dialog -->
    <el-dialog
      v-model="showDisplayModeDialog"
      title="選擇顯示模式"
      width="600px"
      center
    >
      <div class="display-mode-grid">
        <div 
          v-for="mode in displayModes" 
          :key="mode.value"
          class="mode-card"
          :class="{ active: selectedDisplayMode === mode.value }"
          @click="selectedDisplayMode = mode.value"
        >
          <div class="mode-icon">
            <el-icon size="40" :color="mode.color">
              <component :is="mode.icon" />
            </el-icon>
          </div>
          <div class="mode-info">
            <h3>{{ mode.label }}</h3>
            <p>{{ mode.description }}</p>
          </div>
        </div>
      </div>
      
      <template #footer>
        <el-button @click="showDisplayModeDialog = false">取消</el-button>
        <el-button type="primary" @click="openWallWithMode" :disabled="!selectedDisplayMode">
          開始觀看
        </el-button>
      </template>
    </el-dialog>
    
    <!-- Create Wall Dialog -->
    <el-dialog
      v-model="showCreateWallDialog"
      title="創建新祝福牆"
      width="500px"
    >
      <el-form :model="newWallForm" label-width="100px">
        <el-form-item label="牆名稱">
          <el-input v-model="newWallForm.name" placeholder="請輸入祝福牆名稱" />
        </el-form-item>
        
        <el-form-item label="顯示模式">
          <el-select v-model="newWallForm.displayMode" placeholder="選擇顯示模式">
            <el-option label="經典" value="default" />
            <el-option label="網格" value="grid" />
            <el-option label="拍立得" value="polaroid" />
            <el-option label="雜誌" value="magazine" />
            <el-option label="故事" value="stories" />
            <el-option label="增強" value="enhanced" />
          </el-select>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showCreateWallDialog = false">取消</el-button>
        <el-button type="primary" @click="createNewWall">創建</el-button>
      </template>
    </el-dialog>
  </div>
  
  <!-- Loading State -->
  <div v-else-if="loading" class="loading-container">
    <div style="position: fixed; top: 0; right: 0; background: blue; color: white; padding: 10px; z-index: 9999;">
      DEBUG: LOADING - wall={{ !!wall }}, loading={{ loading }}
    </div>
    <el-skeleton :rows="5" animated />
  </div>
  
  <!-- Error State -->
  <div v-else class="error-container">
    <div style="position: fixed; top: 0; right: 0; background: orange; color: white; padding: 10px; z-index: 9999;">
      DEBUG: ERROR - wall={{ !!wall }}, loading={{ loading }}
    </div>
    <el-empty description="找不到該祝福牆">
      <el-button @click="navigateToWallsList" type="primary">
        返回牆列表
      </el-button>
    </el-empty>
  </div>
</template>

<script setup>
import { ArrowLeft, Plus, Setting, Upload, Picture, Tools, Download, Grid, ArrowRight, Monitor, Collection, Camera, Document, Film, PictureRounded } from '@element-plus/icons-vue'
import { useRoute, useRouter } from 'vue-router'
import { useWallsStore } from '~/stores/walls'
import { useMessagesStore } from '~/stores/messages'
import { useAuthStore } from '~/stores/auth'
import WallSwitcher from '~/components/WallSwitcher.vue'

// 定義 PhotoIcon 組件
const PhotoIcon = {
  name: 'PhotoIcon',
  render() {
    return h('svg', {
      viewBox: '0 0 1024 1024',
      width: '1em',
      height: '1em',
      fill: 'currentColor'
    }, [
      h('path', {
        d: 'M928 160H96c-17.7 0-32 14.3-32 32v640c0 17.7 14.3 32 32 32h832c17.7 0 32-14.3 32-32V192c0-17.7-14.3-32-32-32zM896 792H128V224h768v568zM304 456a88 88 0 1 0 0-176 88 88 0 0 0 0 176zm0-116c15.5 0 28 12.5 28 28s-12.5 28-28 28-28-12.5-28-28 12.5-28 28-28zm462.2 195.2L730.7 487c-5.7-6.8-14.1-11-23-11s-17.3 4.2-23 11l-104.6 125.5-80.4-96.5c-5.7-6.8-14.1-11-23-11s-17.3 4.2-23 11L370.2 632.9c-11.7 14-2.9 35.1 14.8 35.1h457c17.7 0 26.5-21.1 14.8-35.1z'
      })
    ])
  }
}

const route = useRoute()
const router = useRouter()
const wallsStore = useWallsStore()
const messagesStore = useMessagesStore()
const authStore = useAuthStore()

// 使用 computed 保持响应性
const userId = computed(() => route.params.userId)
const wallId = computed(() => {
  console.log('Computing wallId from route.params:', route.params.wallId)
  return route.params.wallId
})

const wall = ref(null)
const messages = ref([])
const loading = ref(true)
const showSettings = ref(false)
const showAdminPanel = ref(false)
const showExportDialog = ref(false)
const showCreateWallDialog = ref(false)
const showDisplayModeDialog = ref(false)
const activeAdminTab = ref('messages')
const allWalls = ref([])
const selectedDisplayMode = ref('')
const newWallForm = ref({
  name: '',
  displayMode: 'default'
})

// 背景圖片相關狀態
const currentBackgroundImage = ref('')
const selectedBackgroundFile = ref(null)
const backgroundPreviewUrl = ref('')
const uploadingBackground = ref(false)
const removingBackground = ref(false)

// 顯示模式選項
const displayModes = [
  {
    value: 'default',
    label: '經典模式',
    description: '傳統輪播展示，簡潔優雅',
    icon: 'Monitor',
    color: '#409EFF'
  },
  {
    value: 'grid',
    label: '網格模式',
    description: '多張照片同時展示，視覺豐富',
    icon: 'Grid',
    color: '#67C23A'
  },
  {
    value: 'polaroid',
    label: '拍立得模式',
    description: '復古拍立得風格，懷舊溫馨',
    icon: 'Camera',
    color: '#E6A23C'
  },
  {
    value: 'magazine',
    label: '雜誌模式',
    description: '時尚雜誌版面，專業精美',
    icon: 'Document',
    color: '#F56C6C'
  },
  {
    value: 'stories',
    label: '故事模式',
    description: '豎屏全螢幕，沉浸體驗',
    icon: 'Film',
    color: '#909399'
  },
  {
    value: 'enhanced',
    label: '增強模式',
    description: '豐富動畫效果，互動體驗',
    icon: 'Collection',
    color: '#9C27B0'
  }
]

const shareUrl = computed(() => {
  if (!wall.value) return ''
  return `${window.location.origin}/wall/${wall.value.id}`
})

// 加載牆數據
onMounted(async () => {
  console.log('Wall detail page mounted:', {
    userId: userId.value,
    wallId: wallId,
    routeParams: route.params
  })
  
  try {
    // 等待 app.vue 中的會話恢復完成
    await nextTick()
    let waitCount = 0
    while (!window.__SESSION_RESTORE_COMPLETED && waitCount < 20) {
      await new Promise(resolve => setTimeout(resolve, 50))
      waitCount++
    }
    
    // 檢查會話狀態
    if (!authStore.isAuthenticated || !authStore.userId || !authStore.isSessionValid) {
      console.log('❌ Wall page: No valid session, redirecting to login')
      router.push('/auth/login')
      return
    }
    
    // 檢查用戶權限
    if (authStore.userId !== userId.value) {
      ElMessage.error('無權查看此祝福牆')
      router.push(`/${authStore.userId}/walls`)
      return
    }
    
    // 獲取牆列表
    await wallsStore.fetchUserWalls(userId.value)
    allWalls.value = wallsStore.walls
    
    // 查找特定的牆
    wall.value = wallsStore.walls.find(w => w.id === wallId.value)
    
    if (!wall.value) {
      throw new Error('Wall not found')
    }
    
    // 切換到該牆
    wallsStore.switchWall(wallId.value)
    
    // 獲取牆的消息
    const wallMessages = await messagesStore.fetchWallMessages(userId.value, wallId.value)
    messages.value = wallMessages || []
    
    // 載入當前背景圖片
    await loadCurrentBackground()
    
  } catch (error) {
    console.error('Failed to load wall:', error)
    ElMessage.error('載入祝福牆失敗')
  } finally {
    loading.value = false
  }
})

// 頁面激活時刷新數據（從上傳頁面返回時）
onActivated(async () => {
  console.log('Wall page activated, checking for data refresh...')
  if (wall.value && authStore.isAuthenticated) {
    try {
      const wallMessages = await messagesStore.fetchWallMessages(userId.value, wallId.value)
      messages.value = wallMessages || []
      console.log('Data refreshed on page activation')
    } catch (error) {
      console.error('Failed to refresh messages:', error)
    }
  }
})

// 監聽路由變化以刷新數據
watch(() => route.query, (newQuery, oldQuery) => {
  // 如果有refresh參數，刷新數據
  if (newQuery.refresh && wall.value) {
    console.log('Refresh requested via query parameter')
    refreshWallData()
  }
}, { immediate: false })

// 刷新墻數據的函數
const refreshWallData = async () => {
  if (!wall.value || !authStore.isAuthenticated) return
  
  try {
    loading.value = true
    const wallMessages = await messagesStore.fetchWallMessages(userId.value, wallId.value)
    messages.value = wallMessages || []
    console.log('Wall data refreshed')
  } catch (error) {
    console.error('Failed to refresh wall data:', error)
    ElMessage.error('刷新數據失敗')
  } finally {
    loading.value = false
  }
}

// 格式化日期
const formatDate = (timestamp) => {
  return new Date(timestamp).toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// 導航到牆列表
const navigateToWallsList = () => {
  router.push(`/${userId.value}/walls`)
}

// 導航到上傳頁面
const navigateToUpload = () => {
  console.log('navigateToUpload called with wallId:', wallId.value)
  router.push(`/upload?wallId=${wallId.value}`)
}

// 導航到相簿頁面
const navigateToGallery = () => {
  // 使用扁平路由結構（解決 Nuxt 3 深層嵌套動態路由問題）
  const flatUrl = `/gallery-${userId.value}-${wallId.value}`
  console.log('Navigating to gallery:', flatUrl)
  
  navigateTo(flatUrl)
}

// 觀看公開祝福牆
const viewPublicWall = () => {
  // 打開顯示模式選擇對話框
  selectedDisplayMode.value = wall.value?.settings?.displayMode || 'default'
  showDisplayModeDialog.value = true
}

// 使用選定的模式打開祝福牆
const openWallWithMode = async () => {
  if (!selectedDisplayMode.value) return
  
  
  // 關閉對話框
  showDisplayModeDialog.value = false
  
  // 等待一個 tick 確保對話框完全關閉後再導航
  await nextTick()
  
  try {
    // 使用扁平路由結構（解決 Nuxt 3 深層嵌套動態路由問題）
    const flatUrl = `/wall-display-${userId.value}-${wallId.value}-${selectedDisplayMode.value}`
    
    await navigateTo(flatUrl)
  } catch (error) {
    console.error('Navigation failed:', error)
    ElMessage.error('導航失敗，請稍後再試')
    
    // 備用方案：在新窗口中打開
    const fallbackUrl = `/wall-display-${userId.value}-${wallId.value}-${selectedDisplayMode.value}`
    window.open(fallbackUrl, '_blank')
  }
}

// 顯示當前牆
const showCurrentWall = () => {
  // 滾動到牆展示區域
  const wallElement = document.querySelector('.current-wall-container')
  if (wallElement) {
    wallElement.scrollIntoView({ behavior: 'smooth' })
  }
}

// 處理牆切換
const handleWallChange = async (newWallId) => {
  console.log('Wall changed to:', newWallId)
  if (newWallId && newWallId !== wallId.value) {
    try {
      // 導航到新的牆
      await router.push(`/${userId.value}/walls/${newWallId}`)
    } catch (error) {
      console.error('Failed to switch wall:', error)
      ElMessage.error('切換祝福牆失敗')
    }
  }
}

// 顯示模式文字映射
const getDisplayModeText = (mode) => {
  const modeMap = {
    'default': '經典',
    'grid': '網格',
    'polaroid': '拍立得',
    'magazine': '雜誌',
    'stories': '故事',
    'enhanced': '增強'
  }
  return modeMap[mode] || '經典'
}

// 查看指定模式的祝福牆
const viewWallInMode = (mode) => {
  showDisplayModeDialog.value = false
  
  // 導航到動態路由頁面
  const targetUrl = `/${userId.value}/walls/${wallId.value}/display/${mode}`
  router.push(targetUrl)
}

// 複製牆 ID
const copyWallId = async () => {
  try {
    await navigator.clipboard.writeText(wall.value.id)
    ElMessage.success('已複製牆 ID')
  } catch (error) {
    ElMessage.error('複製失敗')
  }
}

// 複製分享連結
const copyShareUrl = async () => {
  try {
    await navigator.clipboard.writeText(shareUrl.value)
    ElMessage.success('已複製分享連結')
  } catch (error) {
    ElMessage.error('複製失敗')
  }
}

// 格式化完整日期
const formatFullDate = (timestamp) => {
  return new Date(timestamp).toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 獲取今日新增數量
const getTodayMessagesCount = () => {
  if (!messages.value || !Array.isArray(messages.value)) return 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return messages.value.filter(msg => new Date(msg.createdAt) >= today).length
}


// 預覽訊息
const previewMessage = (message) => {
  ElMessageBox.alert(message.message, `${message.name} 的祝福`, {
    confirmButtonText: '確定',
    type: 'info'
  })
}

// 審核通過訊息
const approveMessage = async (message) => {
  try {
    const authenticatedFetch = useAuthenticatedFetch()
    await authenticatedFetch(`/api/users/${userId.value}/walls/${wallId.value}/messages/${message.id}/approve`, {
      method: 'POST'
    })
    
    // 更新本地狀態
    message.status = 'approved'
    message.approved = 'approved'
    ElMessage.success('已審核通過')
  } catch (error) {
    console.error('Approve message error:', error)
    ElMessage.error('審核失敗')
  }
}

// 拒絕訊息
const rejectMessage = async (message) => {
  try {
    await ElMessageBox.confirm(
      `確定要拒絕 ${message.name} 的祝福嗎？`,
      '確認拒絕',
      {
        confirmButtonText: '確定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const authenticatedFetch = useAuthenticatedFetch()
    await authenticatedFetch(`/api/users/${userId.value}/walls/${wallId.value}/messages/${message.id}/reject`, {
      method: 'POST'
    })
    
    // 更新本地狀態
    message.status = 'rejected'
    message.approved = 'rejected'
    ElMessage.success('已拒絕審核')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Reject message error:', error)
      ElMessage.error('拒絕失敗')
    }
  }
}

// 保存牆設置
const saveWallSettings = async () => {
  try {
    if (!wall.value) {
      ElMessage.error('沒有牆數據')
      return
    }
    
    // 呼叫更新設置 API
    const authenticatedFetch = useAuthenticatedFetch()
    const response = await authenticatedFetch(`/api/users/${userId.value}/walls/${wallId.value}/settings`, {
      method: 'PUT',
      body: {
        name: wall.value.name,
        displayMode: wall.value.settings.displayMode,
        isActive: wall.value.isActive,
        settings: {
          ...wall.value.settings,
          autoApprove: wall.value.settings.autoApprove,
          showUnmoderated: wall.value.settings.showUnmoderated,
          autoApproveKeywords: wall.value.settings.autoApproveKeywords,
          autoRejectKeywords: wall.value.settings.autoRejectKeywords,
          backgroundColor: wall.value.settings.backgroundColor,
          textColor: wall.value.settings.textColor,
          fontFamily: wall.value.settings.fontFamily
        }
      }
    })
    
    // 更新本地牆數據
    if (response.wall) {
      wall.value = response.wall
      // 同時更新 wallsStore 中的數據
      await wallsStore.fetchUserWalls(userId.value)
    }
    
    ElMessage.success('設置已保存')
    showAdminPanel.value = false
  } catch (error) {
    console.error('Save wall settings error:', error)
    ElMessage.error('保存失敗')
  }
}

// 背景圖片相關方法
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const onBackgroundFileChange = async (uploadFile) => {
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
  
  selectedBackgroundFile.value = file
  
  // 創建預覽
  const reader = new FileReader()
  reader.onload = (e) => {
    backgroundPreviewUrl.value = e.target?.result
  }
  reader.readAsDataURL(file)
}

const cancelBackgroundUpload = () => {
  selectedBackgroundFile.value = null
  backgroundPreviewUrl.value = ''
}

const uploadBackgroundImage = async () => {
  if (!selectedBackgroundFile.value) return
  
  try {
    uploadingBackground.value = true
    
    const formData = new FormData()
    formData.append('background', selectedBackgroundFile.value)
    
    const authenticatedFetch = useAuthenticatedFetch()
    const response = await authenticatedFetch('/api/wall-background', {
      method: 'POST',
      body: formData
    })
    
    if (response.success) {
      // 更新當前背景圖片
      currentBackgroundImage.value = response.backgroundUrl
      
      // 清除選擇的檔案
      cancelBackgroundUpload()
      
      ElMessage.success('背景圖片上傳成功！')
    } else {
      throw new Error(response.message || '上傳失敗')
    }
  } catch (error) {
    console.error('Upload background error:', error)
    ElMessage.error('上傳失敗，請重試')
  } finally {
    uploadingBackground.value = false
  }
}

const removeBackgroundImage = async () => {
  try {
    removingBackground.value = true
    
    const authenticatedFetch = useAuthenticatedFetch()
    const response = await authenticatedFetch('/api/wall-background', {
      method: 'DELETE'
    })
    
    if (response.success) {
      currentBackgroundImage.value = ''
      ElMessage.success('背景圖片已移除')
    } else {
      throw new Error(response.message || '移除失敗')
    }
  } catch (error) {
    console.error('Remove background error:', error)
    ElMessage.error('移除失敗，請重試')
  } finally {
    removingBackground.value = false
  }
}

const loadCurrentBackground = async () => {
  try {
    const response = await fetch('/api/wall-background')
    if (response.ok) {
      const data = await response.json()
      if (data.success && data.backgroundUrl) {
        currentBackgroundImage.value = data.backgroundUrl
      }
    }
  } catch (error) {
    console.error('Load background error:', error)
  }
}

// 匯出訊息
const exportMessages = async () => {
  try {
    const response = await fetch(`/api/export/messages-csv?wallId=${wallId.value}`)
    if (response.ok) {
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `messages-${wallId.value}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      ElMessage.success('CSV 匯出成功')
    } else {
      throw new Error('Export failed')
    }
  } catch (error) {
    ElMessage.error('匯出失敗')
  }
}

// 匯出圖片
const exportImages = async () => {
  try {
    const response = await fetch(`/api/export/images-zip?wallId=${wallId.value}`)
    if (response.ok) {
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `images-${wallId.value}.zip`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      ElMessage.success('ZIP 匯出成功')
    } else {
      throw new Error('Export failed')
    }
  } catch (error) {
    ElMessage.error('匯出失敗')
  }
}

// 創建新牆
const createNewWall = async () => {
  try {
    if (!newWallForm.value.name.trim()) {
      ElMessage.error("請輸入牆名稱")
      return
    }
    
    const newWall = await wallsStore.createWall({
      name: newWallForm.value.name.trim(),
      displayMode: newWallForm.value.displayMode
    })
    
    // 重新載入牆列表
    await wallsStore.fetchUserWalls(authStore.userId)
    allWalls.value = wallsStore.walls
    
    // 關閉對話框並重置表單
    showCreateWallDialog.value = false
    newWallForm.value = {
      name: "",
      displayMode: "grid"
    }
    
    ElMessage.success("新牆創建成功")
    
    // 導航到新創建的牆
    router.push(`/${authStore.userId}/walls/${newWall.id}`)
    
  } catch (error) {
    console.error("Failed to create wall:", error)
    ElMessage.error("創建牆失敗")
  }
}
</script>

<style scoped>
.wall-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* 導航欄 */
.navigation-bar {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 15px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
}

.nav-left, .nav-right {
  flex: 1;
}

.nav-center {
  flex: 2;
  display: flex;
  justify-content: center;
}

.nav-right {
  display: flex;
  justify-content: flex-end;
}

.back-button {
  border-radius: 25px;
  padding: 8px 16px;
  font-weight: 600;
  box-shadow: 0 4px 15px rgba(64, 158, 255, 0.3);
  transition: all 0.3s ease;
}

.back-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(64, 158, 255, 0.4);
}

/* Hero 區域 */
.hero-section {
  padding: 80px 20px 60px 20px;
  text-align: center;
  color: white;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
}

.hero-title {
  margin-bottom: 40px;
}

.main-title {
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 20px;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  background: linear-gradient(45deg, #fff, #f0f8ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  font-size: 1.4rem;
  opacity: 0.95;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.hero-actions {
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
}

.primary-btn {
  padding: 15px 30px;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: 50px;
  box-shadow: 0 8px 25px rgba(64, 158, 255, 0.3);
  transition: all 0.3s ease;
}

.primary-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 35px rgba(64, 158, 255, 0.4);
}

.secondary-btn {
  padding: 15px 30px;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: 50px;
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: white;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.secondary-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(255, 255, 255, 0.2);
}

/* 主要功能區域 */
.main-features {
  padding: 60px 20px;
  background: white;
}

.section-header {
  text-align: center;
  margin-bottom: 50px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.section-header h2 {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 15px;
}

.section-header p {
  font-size: 1.2rem;
  color: #7f8c8d;
  margin: 0;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 30px;
  max-width: 1200px;
  margin: 0 auto;
}

.feature-card {
  background: white;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.4s ease;
  position: relative;
  overflow: hidden;
  border: 2px solid transparent;
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.feature-card.primary {
  border-color: #409EFF;
}

.feature-card.primary:hover {
  background: linear-gradient(135deg, #409EFF, #66b3ff);
  color: white;
}

.feature-card.featured {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.feature-card.admin {
  border-color: #667eea;
}

.feature-card.admin:hover {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.card-badge {
  position: absolute;
  top: 15px;
  right: 15px;
  background: rgba(255, 255, 255, 0.9);
  color: #f5576c;
  padding: 5px 12px;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 600;
}

.admin-badge {
  background: rgba(255, 255, 255, 0.9);
  color: #667eea;
}

.card-icon {
  margin-bottom: 20px;
  color: #409EFF;
}

.feature-card.featured .card-icon {
  color: white;
}

.feature-card:hover .card-icon {
  color: white;
  transform: scale(1.1);
}

.card-content h3 {
  font-size: 1.4rem;
  font-weight: 600;
  margin-bottom: 10px;
  color: inherit;
}

.card-content p {
  color: #7f8c8d;
  margin: 0;
  line-height: 1.6;
}

.feature-card:hover .card-content p {
  color: rgba(255, 255, 255, 0.9);
}

.card-arrow {
  position: absolute;
  bottom: 20px;
  right: 20px;
  opacity: 0;
  transform: translateX(-10px);
  transition: all 0.3s ease;
  color: #409EFF;
}

.feature-card:hover .card-arrow {
  opacity: 1;
  transform: translateX(0);
  color: white;
}

/* 風格預覽區域 */
.style-showcase {
  padding: 60px 20px;
  background: #f8f9fa;
}

.current-wall-container {
  max-width: 1200px;
  margin: 0 auto;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  background: white;
}

.wall-content {
  padding: 20px;
}

/* 使用指南 */
.guide-section {
  padding: 60px 20px;
  background: white;
}

.guide-steps {
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 800px;
  margin: 0 auto;
  flex-wrap: wrap;
  gap: 20px;
}

.step-item {
  text-align: center;
  flex: 1;
  min-width: 200px;
}

.step-number {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 1.5rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px auto;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.step-content h4 {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: #2c3e50;
}

.step-content p {
  color: #7f8c8d;
  margin: 0;
}

.step-divider {
  color: #667eea;
  font-size: 1.5rem;
  margin: 0 20px;
}

.loading-container,
.error-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.loading-container {
  max-width: 600px;
  margin: 0 auto;
}

/* Gallery Dialog */
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
  padding: 20px;
}

.gallery-item {
  position: relative;
  aspect-ratio: 1;
  cursor: pointer;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.3s ease;
}

.gallery-item:hover {
  transform: scale(1.05);
}

.gallery-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.gallery-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  color: white;
  padding: 10px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.gallery-item:hover .gallery-overlay {
  opacity: 1;
}

.gallery-name {
  font-weight: bold;
  margin: 0 0 4px 0;
}

.gallery-date {
  font-size: 12px;
  margin: 0;
  opacity: 0.8;
}

/* Admin Panel */
.admin-stats {
  display: flex;
  gap: 40px;
  margin-bottom: 20px;
}

/* Export Dialog */
.export-options {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.export-card {
  text-align: center;
}

.export-card p {
  margin: 10px 0 20px 0;
  color: #666;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .navigation-bar {
    padding: 10px 15px;
    flex-direction: column;
    gap: 15px;
  }
  
  .nav-left, .nav-center, .nav-right {
    flex: none;
  }
  
  .main-title {
    font-size: 2.5rem;
  }
  
  .subtitle {
    font-size: 1.1rem;
  }
  
  .hero-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .primary-btn,
  .secondary-btn {
    width: 100%;
    max-width: 300px;
  }
  
  .feature-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .guide-steps {
    flex-direction: column;
  }
  
  .step-divider {
    transform: rotate(90deg);
    margin: 10px 0;
  }
  
  .section-header h2 {
    font-size: 2rem;
  }
  
  .gallery-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 10px;
    padding: 10px;
  }
  
  .admin-stats {
    flex-direction: column;
    gap: 20px;
  }
}

@media (max-width: 480px) {
  .hero-section {
    padding: 60px 15px 40px 15px;
  }
  
  .main-title {
    font-size: 2rem;
  }
  
  .main-features,
  .style-showcase,
  .guide-section {
    padding: 40px 15px;
  }
  
  .feature-card {
    padding: 25px;
  }
  
  .navigation-bar {
    padding: 8px 10px;
  }
}
.form-tip {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
  line-height: 1.4;
}

.time-setting-group {
  display: flex;
  align-items: center;
  gap: 15px;
}

.time-value {
  min-width: 60px;
  text-align: center;
  font-weight: 500;
  color: #409EFF;
  font-size: 14px;
}

.el-divider {
  margin: 25px 0 20px 0;
}

.admin-dialog .el-form-item {
  margin-bottom: 20px;
}

.admin-dialog .el-color-picker {
  width: 100%;
}

/* Display Mode Dialog */
.display-mode-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin: 20px 0;
}

.display-mode-card {
  text-align: center;
  padding: 20px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
}

.display-mode-card:hover {
  border-color: #409EFF;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
  transform: translateY(-2px);
}

.display-mode-card.active {
  border-color: #409EFF;
  background: #f0f9ff;
}

.display-mode-card .mode-icon {
  color: #409EFF;
  margin-bottom: 10px;
}

.display-mode-card h4 {
  margin: 10px 0 5px 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.display-mode-card p {
  margin: 0;
  font-size: 12px;
  color: #666;
  line-height: 1.4;
}

/* 顯示模式選擇對話框 */
.display-mode-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin: 20px 0;
}

.mode-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
  text-align: center;
}

.mode-card:hover {
  border-color: #409EFF;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
  transform: translateY(-2px);
}

.mode-card.active {
  border-color: #409EFF;
  background: #f0f9ff;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.25);
}

.mode-icon {
  margin-bottom: 15px;
  transition: transform 0.3s ease;
}

.mode-card:hover .mode-icon {
  transform: scale(1.1);
}

.mode-info h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.mode-info p {
  margin: 0;
  font-size: 14px;
  color: #666;
  line-height: 1.4;
}

.mode-card.active .mode-info h3 {
  color: #409EFF;
}

@media (max-width: 768px) {
  .display-mode-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .mode-card {
    padding: 15px;
  }
}

/* 背景圖片上傳樣式 */
.background-upload-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.current-background {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.background-preview-container {
  position: relative;
  display: inline-block;
}

.background-preview {
  width: 160px;
  height: 90px;
  object-fit: cover;
  border-radius: 8px;
  border: 2px solid #e4e7ed;
}

.background-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.background-preview-container:hover .background-overlay {
  opacity: 1;
}

.background-info {
  flex: 1;
}

.background-label {
  margin: 0;
  color: #606266;
  font-weight: 500;
  font-size: 14px;
}

.upload-area {
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  padding: 2rem 1rem;
  text-align: center;
  transition: border-color 0.3s ease;
  cursor: pointer;
  background: #fafafa;
}

.upload-area:hover {
  border-color: #409EFF;
  background: #f5f9ff;
}

.upload-area p {
  margin: 0.5rem 0;
  color: #606266;
}

.upload-tip {
  font-size: 12px;
  color: #909399;
}

.background-file-preview {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background: #f8f9fa;
}

.preview-image {
  width: 60px;
  height: 34px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.file-info {
  flex: 1;
}

.file-info p {
  margin: 0.25rem 0;
  color: #606266;
  font-size: 14px;
}

.upload-actions {
  display: flex;
  gap: 0.5rem;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
  line-height: 1.4;
}

/* 時間設定組樣式 */
.time-setting-group {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.time-value {
  min-width: 60px;
  text-align: center;
  font-weight: 500;
  color: #409EFF;
  font-size: 14px;
}

@media (max-width: 768px) {
  .background-file-preview {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .upload-actions {
    width: 100%;
    justify-content: space-between;
  }
  
  .background-preview {
    width: 120px;
    height: 68px;
  }
  
  .current-background {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .time-setting-group {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }
  
  .time-value {
    text-align: left;
  }
}
</style>