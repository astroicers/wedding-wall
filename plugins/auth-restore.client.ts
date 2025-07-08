export default defineNuxtPlugin(() => {
  const authStore = useAuthStore()
  
  // Restore authentication state on app startup
  if (process.client) {
    // Try to restore session from stored data
    const sessionRestored = authStore.restoreSession()
    
    // If session restore failed but we have token in sessionStorage, try to recover
    if (!sessionRestored && window.sessionStorage) {
      const storedToken = window.sessionStorage.getItem('auth-token')
      if (storedToken) {
        console.log('Attempting to recover from sessionStorage token')
        authStore.accessToken = storedToken
        
        // Try to extend session
        authStore.extendSession()
      }
    }
    
    // Debug logging
    console.log('Auth restore plugin:', {
      sessionRestored,
      isAuthenticated: authStore.isAuthenticated,
      userId: authStore.userId,
      hasAccessToken: !!authStore.accessToken,
      sessionExpiry: authStore.sessionExpiry,
      isSessionValid: authStore.isSessionValid,
      sessionStorageToken: !!window.sessionStorage?.getItem('auth-token')
    })
  }
})