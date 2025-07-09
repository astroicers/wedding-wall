export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const url = query.url as string
    
    if (!url) {
      throw createError({
        statusCode: 400,
        statusMessage: 'URL parameter is required'
      })
    }
    
    // 只允許代理 Google 頭像
    if (!url.includes('googleusercontent.com')) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Only Google avatars are allowed'
      })
    }
    
    console.log('🖼️ Proxying avatar URL:', url)
    
    // 使用 fetch 獲取頭像
    const response = await fetch(url)
    
    if (!response.ok) {
      throw createError({
        statusCode: response.status,
        statusMessage: `Failed to fetch avatar: ${response.statusText}`
      })
    }
    
    const contentType = response.headers.get('content-type') || 'image/jpeg'
    const buffer = await response.arrayBuffer()
    
    // 設置響應頭
    setHeader(event, 'Content-Type', contentType)
    setHeader(event, 'Cache-Control', 'public, max-age=86400') // 24小時緩存
    setHeader(event, 'Access-Control-Allow-Origin', '*')
    
    return new Uint8Array(buffer)
    
  } catch (error: any) {
    console.error('❌ Avatar proxy error:', error)
    
    // 返回默認頭像或錯誤
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Avatar proxy failed'
    })
  }
})