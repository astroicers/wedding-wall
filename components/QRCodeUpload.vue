<template>
  <div class="qr-code-container">
    <div class="qr-code-content">
      <div class="qr-code">
        <img :src="qrCodeUrl" alt="上傳祝福 QR Code" />
      </div>
      <div class="qr-text">
        <span>掃碼上傳祝福</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 生成上傳頁面的 URL
const uploadUrl = 'http://wall.uat.astroicers.link:8080/upload'

// 使用 QR Server API 生成 QR Code
const qrCodeUrl = computed(() => {
  const size = '150x150'
  const encodedUrl = encodeURIComponent(uploadUrl)
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}&data=${encodedUrl}`
})
</script>

<style scoped>
.qr-code-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 999;
  transition: all 0.3s ease;
  opacity: 0.8;
}

.qr-code-container:hover {
  opacity: 1;
  transform: scale(1.05);
}

.qr-code-content {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  text-align: center;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.qr-code {
  margin-bottom: 8px;
}

.qr-code img {
  width: 120px;
  height: 120px;
  border-radius: 8px;
  border: 2px solid #f0f0f0;
}

.qr-text {
  font-size: 12px;
  color: #666;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.qr-text span {
  background: linear-gradient(45deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .qr-code-container {
    bottom: 15px;
    right: 15px;
  }
  
  .qr-code-content {
    padding: 12px;
  }
  
  .qr-code img {
    width: 100px;
    height: 100px;
  }
  
  .qr-text {
    font-size: 11px;
  }
}

@media (max-width: 480px) {
  .qr-code-container {
    bottom: 10px;
    right: 10px;
  }
  
  .qr-code img {
    width: 80px;
    height: 80px;
  }
  
  .qr-text {
    font-size: 10px;
  }
}
</style>