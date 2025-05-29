<template>
    <div class="wall" v-if="messages.length">
      <MessageCard :message="messages[current]" />
    </div>
  </template>
  
  <script setup lang="ts">
  import MessageCard from '~/components/MessageCard.vue'
  const messages = ref([])
  const current = ref(0)
  
  async function fetchMessages() {
    const res = await fetch('/api/metadata')
    messages.value = await res.json()
  }
  
  onMounted(async () => {
    await fetchMessages()
  
    setInterval(() => {
      if (messages.value.length > 0)
        current.value = (current.value + 1) % messages.value.length
    }, 3000)
  
    setInterval(() => {
      fetchMessages()
    }, 5000)
  })
  </script>
  
  <style scoped>
  .wall {
    max-width: 600px;
    margin: 0 auto;
    padding-top: 80px;
  }
  </style>