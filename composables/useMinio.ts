export const useMinio = () => {
  const generateImageUrl = (filename: string): string => {
    if (!filename) return ''
    return `/api/image/${encodeURIComponent(filename)}`
  }

  const extractFilenameFromUrl = (url: string): string => {
    const match = url.match(/\/api\/image\/(.+)$/)
    return match ? decodeURIComponent(match[1]) : ''
  }

  const isValidImageType = (file: File): boolean => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    return allowedTypes.includes(file.type)
  }

  const getImagePreviewUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target?.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return {
    generateImageUrl,
    extractFilenameFromUrl,
    isValidImageType,
    getImagePreviewUrl,
    formatFileSize
  }
}