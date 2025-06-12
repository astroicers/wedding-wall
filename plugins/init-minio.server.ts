import { initializeMinio } from '~/server/utils/init-minio'

export default defineNuxtPlugin(async () => {
  if (process.server) {
    console.log('🚀 初始化 MinIO...')
    await initializeMinio()
  }
})