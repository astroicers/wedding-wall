<template>
  <div>
    <el-input v-model="name" placeholder="填寫名字後直接發訊息" />
    <el-button @click="anonymousLogin" style="margin-top: 0.5rem">確定</el-button>
  </div>
</template>

<script setup lang="ts">
const name = ref('')
const auth = useAuth()

function anonymousLogin() {
  if (name.value) {
    auth.value = name.value
    navigateTo('/upload')
  }
}
</script>