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
  plugins: ['~/plugins/photo-preview.client']
})