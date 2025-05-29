<template>
    <el-card class="box-card">
      <div><strong>{{ message.name }}</strong>：</div>
      <div>{{ message.text }}</div>
      <div v-if="message.photo">
        <img :src="message.photo" alt="photo" style="width: 100%; margin-top: 1rem" />
      </div>
    </el-card>
  </template>
  
  <script setup lang="ts">
  defineProps<{ message: { name: string, text: string, photo?: string } }>()
  </script>
  