export default defineNuxtConfig({
  css: ['element-plus/dist/index.css'],
  build: {
    transpile: ['element-plus'],
  },
  modules: [
    '@element-plus/nuxt',
    '@pinia/nuxt'
  ],
  
  pinia: {
    storesDirs: ['./stores/**']
  },
  
  // 為 Pinia 持久化添加配置
  ssr: true,
  plugins: [
    '~/plugins/photo-preview.client',
    '~/plugins/google-fonts.client'
  ],
  
  // 添加 Google Fonts 相關的 head 設定
  app: {
    head: {
      link: [
        // DNS prefetch for Google Fonts
        { rel: 'dns-prefetch', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous' }
      ]
    }
  },
  
  // 開發模式下的配置
  devtools: { enabled: true },
  
  // Nitro 配置
  nitro: {
    // CSP headers are configured in server/middleware/security.ts
  },
  
  // Runtime config for OAuth
  runtimeConfig: {
    // 私有設定 (僅伺服器端)
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    jwtSecret: process.env.JWT_SECRET || 'your-jwt-secret-key',
    
    public: {
      // 公開設定
      googleClientId: process.env.GOOGLE_CLIENT_ID || '',
      authProvider: process.env.AUTH_PROVIDER || 'google', // 'google' | 'keycloak'
      appUrl: process.env.APP_URL || 'http://localhost:3000'
    }
  }
})