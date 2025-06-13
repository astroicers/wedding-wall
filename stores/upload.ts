export interface UploadRecord {
  id: string
  filename: string
  timestamp: number
  status: 'success' | 'failed'
  type: 'photo' | 'background'
}

export interface UploadState {
  isUploading: boolean
  uploadProgress: number
  error: string | null
  uploadHistory: UploadRecord[]
  currentUploadType: 'photo' | 'background' | null
}

export const useUploadStore = defineStore('upload', {
  state: (): UploadState => ({
    isUploading: false,
    uploadProgress: 0,
    error: null,
    uploadHistory: [],
    currentUploadType: null
  }),

  getters: {
    canUpload: (state) => !state.isUploading,
    
    recentUploads: (state) => {
      return state.uploadHistory
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 10)
    },

    successfulUploads: (state) => {
      return state.uploadHistory.filter(upload => upload.status === 'success')
    },

    failedUploads: (state) => {
      return state.uploadHistory.filter(upload => upload.status === 'failed')
    }
  },

  actions: {
    // 開始上傳
    startUpload(type: 'photo' | 'background') {
      this.isUploading = true
      this.uploadProgress = 0
      this.error = null
      this.currentUploadType = type
    },

    // 更新上傳進度
    updateProgress(progress: number) {
      this.uploadProgress = Math.min(100, Math.max(0, progress))
    },

    // 上傳成功
    uploadSuccess(filename: string) {
      const record: UploadRecord = {
        id: Date.now().toString(),
        filename,
        timestamp: Date.now(),
        status: 'success',
        type: this.currentUploadType || 'photo'
      }
      
      this.uploadHistory.push(record)
      this.resetUploadState()
      
      console.log('上傳成功:', filename)
    },

    // 上傳失敗
    uploadFailed(error: string, filename?: string) {
      this.error = error
      
      if (filename) {
        const record: UploadRecord = {
          id: Date.now().toString(),
          filename,
          timestamp: Date.now(),
          status: 'failed',
          type: this.currentUploadType || 'photo'
        }
        this.uploadHistory.push(record)
      }
      
      this.resetUploadState()
      console.error('上傳失敗:', error)
    },

    // 重置上傳狀態
    resetUploadState() {
      this.isUploading = false
      this.uploadProgress = 0
      this.currentUploadType = null
    },

    // 清除錯誤
    clearError() {
      this.error = null
    },

    // 清除上傳歷史
    clearUploadHistory() {
      this.uploadHistory = []
    },

    // 移除特定上傳記錄
    removeUploadRecord(id: string) {
      this.uploadHistory = this.uploadHistory.filter(record => record.id !== id)
    }
  },

  // 持久化上傳歷史 - 僅在客戶端啟用
  persist: process.client ? {
    storage: localStorage,
    paths: ['uploadHistory']
  } : false
})