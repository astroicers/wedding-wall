export default defineNuxtConfig({
  css: ['element-plus/dist/index.css'],
  build: {
    transpile: ['element-plus'],
  },
  modules: [
    '@element-plus/nuxt'
  ],
  plugins: ['~/plugins/photo-preview.client']
})