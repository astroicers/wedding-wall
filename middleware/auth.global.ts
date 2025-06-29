export default defineNuxtRouteMiddleware((to) => {
  // Skip auth for API routes and login page
  if (to.path.startsWith('/api') || to.path === '/login') {
    return
  }

  // Only check auth on client side
  if (import.meta.client) {
    const authStore = useAuthStore()
    
    // Access the store state directly
    if (!authStore.isAuthenticated || !authStore.sessionExpiry || Date.now() > authStore.sessionExpiry) {
      // Clear auth state
      authStore.$patch({
        user: null,
        isAuthenticated: false,
        loginTime: null,
        sessionExpiry: null
      })
      
      return navigateTo('/login')
    }
  }
})