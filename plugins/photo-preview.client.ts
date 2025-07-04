import { defineNuxtPlugin } from '#app'
import PhotoPreview from 'vue3-photo-preview'
import 'vue3-photo-preview/dist/index.css'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(PhotoPreview)
})
