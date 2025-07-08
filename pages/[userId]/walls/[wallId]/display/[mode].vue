<template>
  <div class="redirect-screen">
    <div class="loading-spinner">Loading...</div>
    <p>Redirecting...</p>
  </div>
</template>

<script setup lang="ts">
// Redirect to flat route structure
const route = useRoute();
const userId = route.params.userId as string;
const wallId = route.params.wallId as string;
const mode = route.params.mode as string;

// Immediately redirect to flat route
const flatUrl = `/wall-display-${userId}-${wallId}-${mode}`;
await navigateTo(flatUrl, { replace: true });
</script>

<style scoped>
.redirect-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-align: center;
  gap: 1rem;
  font-size: 1.2rem;
}

.loading-spinner {
  font-size: 1.5rem;
  font-weight: bold;
}
</style>