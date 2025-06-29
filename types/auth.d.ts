import type { Store } from 'pinia'

declare module '#app' {
  interface NuxtApp {
    $authStore: ReturnType<typeof useAuthStore>
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $authStore: ReturnType<typeof useAuthStore>
  }
}

export {}