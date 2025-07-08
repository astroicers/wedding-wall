<template>
  <div style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: green; color: white; padding: 20px; z-index: 9999;">
    <h1>✅ DIRECT TEST PAGE WORKS!</h1>
    <p>This confirms that dynamic routing works for this path level</p>
    <p>User ID: {{ $route.params.userId }}</p>
    <p>Wall ID: {{ $route.params.wallId }}</p>
    <button @click="$router.back()">Go Back</button>
  </div>
</template>

<script setup>
console.log('✅ DIRECT TEST PAGE LOADED!')
console.log('Route params:', useRoute().params)
</script>