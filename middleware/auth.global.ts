export default defineNuxtRouteMiddleware((to) => {
  // Skip auth for API routes and auth pages only
  if (to.path.startsWith('/api') || 
      to.path.startsWith('/auth')) {
    return
  }

  // Only check auth on client side
  if (import.meta.client) {
    const authStore = useAuthStore()
    
    console.log('🔐 Auth middleware check for route:', to.path)
    console.log('🔐 Auth state:', {
      isAuthenticated: authStore.isAuthenticated,
      userId: authStore.userId,
      sessionExpiry: authStore.sessionExpiry,
      currentTime: Date.now(),
      sessionValid: authStore.sessionExpiry ? Date.now() < authStore.sessionExpiry : false
    })
    
    // Check if user is authenticated and session is valid
    if (!authStore.isAuthenticated || !authStore.sessionExpiry || Date.now() > authStore.sessionExpiry) {
      console.log('❌ Auth check failed, redirecting to login')
      
      // Clear auth state
      authStore.$patch({
        user: null,
        userProfile: null,
        userId: null,
        accessToken: null,
        refreshToken: null,
        ssoProvider: null,
        isAuthenticated: false,
        loginTime: null,
        sessionExpiry: null
      })
      
      // Clear sessionStorage
      if (window.sessionStorage) {
        window.sessionStorage.removeItem('auth-token')
      }
      
      return navigateTo('/auth/login')
    }
    
    console.log('✅ Auth check passed')
  }
})