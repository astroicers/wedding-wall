export interface MessageData {
  name: string
  text: string
  photo: string
  timestamp?: number
}

export interface MessagesState {
  messages: MessageData[]
  loading: boolean
  error: string | null
  lastUpdated: number | null
  autoRefresh: boolean
}

export const useMessagesStore = defineStore('messages', {
  state: (): MessagesState => ({
    messages: [],
    loading: false,
    error: null,
    lastUpdated: null,
    autoRefresh: true
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
    }
  },

  actions: {
    // 載入訊息
    async fetchMessages(showError = true) {
      // 如果資料是新鮮的且不是強制更新，則跳過
      if (this.loading) return

      this.loading = true
      if (showError) this.error = null

      try {
        const response = await fetch('/api/messages')
        
        if (response.ok) {
          const data = await response.json()
          this.messages = data.messages || []
          this.lastUpdated = Date.now()
          
          if (showError && this.error) {
            this.error = null // 清除之前的錯誤
          }
          
          console.log('訊息載入成功，共', this.messages.length, '則')
        } else {
          throw new Error('載入訊息失敗')
        }
      } catch (error: any) {
        if (showError) {
          this.error = error.message || '載入訊息失敗'
          console.error('載入訊息失敗:', error)
        }
      } finally {
        this.loading = false
      }
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
    }
  }
})