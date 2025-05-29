<template>
    <div class="container">
      <h3>上傳祝福</h3>
      <UploadForm />
    </div>
  </template>
  
  <script setup>
  import UploadForm from '~/components/UploadForm.vue'
  const auth = useAuth()
  
  if (!auth.value) navigateTo('/')
  </script>
  
  <style scoped>
  .container {
    max-width: 480px;
    margin: 0 auto;
    padding-top: 80px;
  }
  </style>