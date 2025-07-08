// Helper composable to handle message data compatibility between old and new formats
export const useMessageCompat = () => {
  // Get message text with backward compatibility
  const getMessageText = (message: any): string => {
    return message.message || message.text || ''
  }
  
  // Get image path with backward compatibility  
  const getImagePath = (message: any): string => {
    if (message.imagePath) {
      return `/api/image/${message.imagePath}`
    }
    return message.photo || ''
  }
  
  // Get timestamp with backward compatibility
  const getTimestamp = (message: any): number => {
    return message.createdAt || message.timestamp || 0
  }
  
  // Get message ID
  const getMessageId = (message: any): string => {
    return message.id || `${message.timestamp || Date.now()}`
  }
  
  return {
    getMessageText,
    getImagePath,
    getTimestamp,
    getMessageId
  }
}