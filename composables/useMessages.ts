interface MessageData {
  name: string
  text: string
  photo?: string
}

export const useMessages = () => {
  const messages = useState<MessageData[]>('messages', () => [])
  const { fetchMessages } = useApi()

  const loadMessages = async (showError = true) => {
    try {
      messages.value = await fetchMessages()
    } catch (error) {
      if (showError && import.meta.client) {
        ElMessage.error('載入訊息失敗')
      }
      console.error('載入訊息失敗:', error)
    }
  }

  const refreshMessages = () => {
    return loadMessages()
  }

  return {
    messages: readonly(messages),
    loadMessages,
    refreshMessages
  }
}