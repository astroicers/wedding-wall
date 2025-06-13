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

// 判斷是否顯示導航 (所有祝福牆頁面都不顯示導航，保持全螢幕體驗)
const route = useRoute()
const showNavigation = computed(() => {
  const wallPaths = ['/wall', '/wall-enhanced', '/wall-stories', '/wall-magazine', '/wall-polaroid']
  return !wallPaths.includes(route.path)
})
</script>

<style>
/* 全局樣式重置 - 移除所有邊距和padding */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  margin: 0;
  padding: 0;
  overflow-x: hidden;
}

/* 祝福牆頁面專用的body樣式 */
body:has([data-page="wall"]) {
  overflow: hidden !important;
  height: 100vh !important;
  width: 100vw !important;
}

.app-layout {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  margin: 0;
  padding: 0;
}

.main-content {
  min-height: 100vh;
  transition: all 0.3s ease;
  margin: 0;
  padding: 0;
}

.main-content.with-nav {
  min-height: calc(100vh - 80px);
}

/* 祝福牆頁面特殊樣式 */
.main-content:has([data-page="wall"]) {
  background: #000;
  min-height: 100vh !important;
  height: 100vh !important;
  width: 100vw !important;
  overflow: hidden !important;
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  margin: 0 !important;
  padding: 0 !important;
}
</style>
  