<template>
  <div class="app-layout">
    <Navigation v-if="showNavigation" />
    <main class="main-content" :class="{ 'with-nav': showNavigation }">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import Navigation from '~/components/Navigation.vue'

// 判斷是否顯示導航 (祝福牆頁面不顯示導航，保持全螢幕體驗)
const route = useRoute()
const showNavigation = computed(() => route.path !== '/wall')
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.main-content {
  min-height: 100vh;
  transition: all 0.3s ease;
}

.main-content.with-nav {
  min-height: calc(100vh - 80px);
}

/* 特殊頁面樣式 */
.main-content:has([data-page="wall"]) {
  background: #000;
}
</style>
  