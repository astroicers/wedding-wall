interface MessageData {
  name: string
  text: string
  photo?: string
}

interface UploadResult {
  url: string
}

export const useApi = () => {
  
  const apiRequest = async <T>(url: string, options?: RequestInit): Promise<T> => {
    try {
      const authenticatedFetch = useAuthenticatedFetch()
      const response = await authenticatedFetch.raw(url, options)
      
      if (!response.ok) {
        let errorMessage = 'API 請求失敗'
        
        try {
          const errorData = await response.json()
          errorMessage = errorData.message || errorData.statusMessage || errorMessage
        } catch {
          // 如果無法解析錯誤回應，使用預設訊息
          errorMessage = `HTTP ${response.status}: ${response.statusText}`
        }
        
        throw {
          statusCode: response.status,
          statusMessage: errorMessage,
          message: errorMessage
        }
      }
      
      return await response.json()
    } catch (error) {
      console.error('API 請求錯誤:', error)
      throw error
    }
  }

  const fetchMessages = async (): Promise<MessageData[]> => {
    const response = await apiRequest<{ success: boolean; messages: MessageData[]; total: number }>('/api/messages')
    return response.messages || []
  }

  const uploadMessage = async (formData: FormData): Promise<UploadResult> => {
    try {
      const authenticatedFetch = useAuthenticatedFetch()
      const response = await authenticatedFetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      return response
    } catch (error) {
      console.error('Upload error:', error)
      throw error
    }
  }

  return {
    apiRequest,
    fetchMessages,
    uploadMessage
  }
}