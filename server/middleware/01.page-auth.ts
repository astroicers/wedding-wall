import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
  // Only check for page requests (HTML content), not API or assets
  const url = event.node.req.url
  const method = event.node.req.method
  
  // Skip non-GET requests
  if (method !== 'GET' || !url) {
    return
  }
  
  // Skip API requests
  if (url.startsWith('/api/')) {
    return
  }
  
  // Skip asset requests
  if (url.startsWith('/_nuxt/') || url.includes('.')) {
    return
  }
  
  // Skip auth pages
  if (url.startsWith('/auth/')) {
    return
  }

  // Get session token from cookies
  const sessionToken = getCookie(event, 'session-token')
  
  // Check if user has valid authentication
  if (!sessionToken) {
    // Redirect to login page for unauthenticated users
    await sendRedirect(event, '/auth/login', 302)
    return
  }

  // Verify JWT token validity
  try {
    const config = useRuntimeConfig()
    jwt.verify(sessionToken, config.jwtSecret)
  } catch (error) {
    // Invalid token, redirect to login
    await sendRedirect(event, '/auth/login', 302)
    return
  }
})