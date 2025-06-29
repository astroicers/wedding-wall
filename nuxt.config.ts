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
  }
})