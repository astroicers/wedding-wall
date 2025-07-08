export interface MessageData {
  id: string
  name: string
  message: string // Changed from 'text' to match upload API
  imagePath: string // Changed from 'photo' to match upload API
  wallId: string
  createdAt: number // Changed from 'timestamp' to match upload API
  approved: 'approved' | 'pending' | 'rejected'
  // Legacy support
  text?: string
  photo?: string
  timestamp?: number
}

export interface MessagesState {
  messages: MessageData[]
  loading: boolean
  error: string | null
  lastUpdated: number | null
  autoRefresh: boolean
  // New properties for multi-wall support
  wallId: string | null
  userId: string | null
}

export const useMessagesStore = defineStore('messages', {
  state: (): MessagesState => ({
    messages: [],
    loading: false,
    error: null,
    lastUpdated: null,
    autoRefresh: true,
    wallId: null,
    userId: null
  }),

  getters: {
    messageCount: (state) => state.messages.length,
    
    hasMessages: (state) => state.messages.length > 0,
    
    latestMessage: (state) => {
      if (state.messages.length === 0) return null
      return state.messages[state.messages.length - 1]
    },

    isDataFresh: (state) => {
      if (!state.lastUpdated) return false
      // 資料在 5 秒內算是新鮮的
      return (Date.now() - state.lastUpdated) < 5000
    },

    // Check if messages are loaded for a specific wall
    isWallLoaded: (state) => (userId: string, wallId: string) => {
      return state.userId === userId && state.wallId === wallId && state.messages.length >= 0
    },

    // Get current wall context
    currentContext: (state) => ({
      userId: state.userId,
      wallId: state.wallId
    })
  },

  actions: {
    // Load messages for a specific wall
    async fetchWallMessages(userId: string, wallId: string, showError = true) {
      // If already loading messages for this wall, skip
      if (this.loading && this.userId === userId && this.wallId === wallId) return this.messages

      this.loading = true
      if (showError) this.error = null

      try {
        const authenticatedFetch = useAuthenticatedFetch()
        const data = await authenticatedFetch(`/api/users/${userId}/walls/${wallId}/messages`)
        
        this.messages = data.messages || []
        this.userId = userId
        this.wallId = wallId
        this.lastUpdated = Date.now()
        
        if (showError && this.error) {
          this.error = null // Clear previous error
        }
        
        console.log(`Messages loaded for wall ${wallId}, count: ${this.messages.length}`)
        return this.messages
      } catch (error: any) {
        if (showError) {
          this.error = error.message || 'Failed to load wall messages'
          console.error('Failed to load wall messages:', error)
        }
        return []
      } finally {
        this.loading = false
      }
    },

    // Load legacy messages (for backward compatibility)
    async fetchLegacyMessages(showError = true) {
      // If already loading, skip
      if (this.loading) return

      this.loading = true
      if (showError) this.error = null

      try {
        const response = await fetch('/api/messages')
        
        if (response.ok) {
          const data = await response.json()
          this.messages = data.messages || []
          this.userId = null // Legacy mode
          this.wallId = null // Legacy mode
          this.lastUpdated = Date.now()
          
          if (showError && this.error) {
            this.error = null // Clear previous error
          }
          
          console.log('Legacy messages loaded, count:', this.messages.length)
        } else {
          throw new Error('Failed to load messages')
        }
      } catch (error: any) {
        if (showError) {
          this.error = error.message || 'Failed to load messages'
          console.error('Failed to load messages:', error)
        }
      } finally {
        this.loading = false
      }
    },

    // 載入訊息 (updated to use legacy loading for backward compatibility)
    async fetchMessages(showError = true) {
      return this.fetchLegacyMessages(showError)
    },

    // 添加新訊息
    async addMessage(messageData: MessageData) {
      try {
        // 先樂觀更新本地狀態
        const newMessage = {
          ...messageData,
          timestamp: Date.now()
        }
        this.messages.push(newMessage)
        
        // 然後重新載入以確保同步
        await this.fetchMessages(false)
        
        console.log('新訊息已添加')
      } catch (error) {
        // 如果失敗，移除樂觀添加的訊息
        this.messages.pop()
        throw error
      }
    },

    // 強制重新載入
    async refreshMessages() {
      this.lastUpdated = null // 重置時間戳，強制重新載入
      await this.fetchMessages(true)
    },

    // 清除錯誤
    clearError() {
      this.error = null
    },

    // 設定自動重新整理
    setAutoRefresh(enabled: boolean) {
      this.autoRefresh = enabled
    },

    // 清空所有訊息（用於測試）
    clearMessages() {
      this.messages = []
      this.lastUpdated = null
      this.error = null
      this.wallId = null
      this.userId = null
    },

    // Set current wall context without loading messages
    setWallContext(userId: string, wallId: string) {
      this.userId = userId
      this.wallId = wallId
    },

    // Clear wall context (return to legacy mode)
    clearWallContext() {
      this.wallId = null
      this.userId = null
    },

    // Refresh current wall messages
    async refreshWallMessages() {
      if (this.wallId && this.userId) {
        this.lastUpdated = null
        await this.fetchWallMessages(this.userId, this.wallId, true)
      } else {
        // Fall back to legacy refresh
        await this.refreshMessages()
      }
    }
  }
})