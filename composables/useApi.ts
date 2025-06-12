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
      const response = await fetch(url, options)
      
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
    return apiRequest<MessageData[]>('/api/metadata')
  }

  const uploadMessage = async (formData: FormData): Promise<UploadResult> => {
    return apiRequest<UploadResult>('/api/upload', {
      method: 'POST',
      body: formData
    })
  }

  return {
    apiRequest,
    fetchMessages,
    uploadMessage
  }
}