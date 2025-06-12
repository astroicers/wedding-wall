<template>
  <div class="navigation-bar">
    <el-row justify="space-between" align="middle">
      <el-col :span="8">
        <div class="logo" @click="navigateTo('/')">
          <el-icon size="24">
            <Star />
          </el-icon>
          <span>祝福牆</span>
        </div>
      </el-col>
      <el-col :span="16">
        <div class="nav-links">
          <el-button 
            text 
            :class="{ active: $route.path === '/' }"
            @click="navigateTo('/')"
          >
            首頁
          </el-button>
          <el-button 
            text 
            :class="{ active: $route.path === '/upload' }"
            @click="navigateTo('/upload')"
          >
            上傳祝福
          </el-button>
          <el-button 
            text 
            :class="{ active: $route.path === '/wall' }"
            @click="navigateTo('/wall')"
          >
            祝福牆
          </el-button>
          <el-button 
            text 
            :class="{ active: $route.path === '/gallery' }"
            @click="navigateTo('/gallery')"
          >
            相簿
          </el-button>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { Star } from '@element-plus/icons-vue'
</script>

<style scoped>
.navigation-bar {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 1rem 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  color: #409EFF;
  font-weight: 600;
  font-size: 1.1rem;
  transition: color 0.3s ease;
}

.logo:hover {
  color: #337ecc;
}

.nav-links {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.nav-links .el-button {
  font-weight: 500;
  color: #606266;
  transition: all 0.3s ease;
}

.nav-links .el-button:hover {
  color: #409EFF;
  background-color: rgba(64, 158, 255, 0.1);
}

.nav-links .el-button.active {
  color: #409EFF;
  background-color: rgba(64, 158, 255, 0.1);
  font-weight: 600;
}

@media (max-width: 768px) {
  .navigation-bar {
    padding: 0.75rem 1rem;
  }
  
  .nav-links {
    gap: 0.25rem;
  }
  
  .nav-links .el-button {
    padding: 0.5rem 0.75rem;
    font-size: 0.9rem;
  }
  
  .logo span {
    display: none;
  }
}

@media (max-width: 480px) {
  .nav-links .el-button {
    padding: 0.5rem 0.5rem;
    font-size: 0.8rem;
  }
}
</style>