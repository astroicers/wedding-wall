export const useAuthenticatedFetch = () => {
  return $fetch.create({
    onRequest({ request, options }) {
      // Only add auth header for API routes
      if (typeof request === 'string' && request.startsWith('/api/')) {
        let token = null
        let tokenSource = 'none'
        let debugInfo: any = {
          url: request,
          processClient: process.client,
          hasWindow: typeof window !== 'undefined',
          hasSessionStorage: typeof window !== 'undefined' && !!window.sessionStorage
        }
        
        // Try to get token from sessionStorage first (most reliable)
        if (process.client && window.sessionStorage) {
          try {
            token = window.sessionStorage.getItem('auth-token')
            debugInfo.sessionStorageToken = token ? `${token.substring(0, 20)}...` : 'null'
            if (token) {
              tokenSource = 'sessionStorage'
            }
          } catch (error) {
            debugInfo.sessionStorageError = error.message
          }
        }
        
        // Fallback to cookie
        if (!token && process.client) {
          try {
            const authCookie = useCookie('auth-token')
            debugInfo.cookieValue = authCookie.value ? `${authCookie.value.substring(0, 20)}...` : 'null'
            if (authCookie.value) {
              token = authCookie.value
              tokenSource = 'cookie'
            }
          } catch (error) {
            debugInfo.cookieError = error.message
          }
        }
        
        // Try direct document.cookie as last resort
        if (!token && process.client && typeof document !== 'undefined') {
          try {
            const cookieMatch = document.cookie.match(/auth-token=([^;]+)/)
            if (cookieMatch) {
              token = cookieMatch[1]
              tokenSource = 'document.cookie'
              debugInfo.documentCookie = `${token.substring(0, 20)}...`
            }
          } catch (error) {
            debugInfo.documentCookieError = error.message
          }
        }
        
        if (token) {
          options.headers = {
            ...options.headers,
            'Authorization': `Bearer ${token}`
          }
          console.log('✅ API request with auth token:', {
            url: request,
            tokenSource,
            tokenPreview: `${token.substring(0, 20)}...`,
            headerSet: true
          })
        } else {
          console.error('❌ No authentication token found for API request:', debugInfo)
        }
      }
    },
    onResponseError({ request, response }) {
      if (response.status === 401) {
        console.error('🔒 Authentication failed for request:', {
          url: request,
          status: response.status,
          statusText: response.statusText
        })
      }
    }
  })
}