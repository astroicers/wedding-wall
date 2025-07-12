# 🆓 免費部署方案指南

## 方案一：Netlify + Supabase Storage（推薦）

### 架構調整
- **前端**: Netlify（靜態網站託管）
- **後端 API**: Netlify Functions
- **存儲**: Supabase Storage（取代 MinIO）
- **認證**: Netlify Identity 或自定義 JWT

### 優點
- ✅ 完全免費（合理使用內）
- ✅ 自動 HTTPS
- ✅ 全球 CDN
- ✅ 簡單部署

### 限制
- 100GB 流量/月
- 300 分鐘構建時間/月
- Supabase: 1GB 存儲, 2GB 流量

### 部署步驟
```bash
# 1. 安裝 Netlify CLI
npm install -g netlify-cli

# 2. 建立 netlify.toml
cat > netlify.toml << EOF
[build]
  command = "npm run generate"
  publish = ".output/public"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200
EOF

# 3. 部署
netlify deploy --prod
```

## 方案二：Vercel + Cloudinary

### 架構調整
- **前端**: Vercel
- **後端 API**: Vercel Edge Functions  
- **圖片存儲**: Cloudinary（免費 25GB）
- **元數據**: Vercel KV（免費方案）

### 程式碼調整範例

```typescript
// server/api/upload-cloudinary.post.ts
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

export default defineEventHandler(async (event) => {
  const form = await readMultipartFormData(event)
  const file = form.find(f => f.name === 'photo')
  
  if (file) {
    const result = await cloudinary.uploader.upload(
      `data:${file.type};base64,${file.data.toString('base64')}`,
      { folder: 'wedding-wall' }
    )
    
    return { url: result.secure_url }
  }
})
```

## 方案三：GitHub Pages + Firebase

### 架構
- **靜態網站**: GitHub Pages（完全免費）
- **後端**: Firebase Cloud Functions
- **存儲**: Firebase Storage（5GB 免費）
- **資料庫**: Firestore（1GB 免費）

### 優點
- ✅ 穩定可靠
- ✅ Google 基礎設施
- ✅ 即時資料同步

## 方案四：免費 VPS 方案

### 選項
1. **Oracle Cloud Free Tier**
   - 永久免費
   - 2個 AMD 虛擬機器
   - 可運行完整 Docker 環境

2. **Google Cloud Free Tier** 
   - $300 美金試用額度
   - e2-micro 執行個體永久免費

3. **AWS Free Tier**
   - t2.micro 12個月免費
   - 適合短期使用

### VPS 部署腳本
```bash
#!/bin/bash
# 快速部署腳本

# 安裝 Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# 安裝 Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 克隆專案
git clone https://github.com/yourusername/wedding-wall.git
cd wedding-wall

# 使用生產環境配置
cp .env.production.example .env
# 編輯 .env 設定密碼

# 啟動
docker-compose -f docker-compose.production.yml up -d
```

## 🔄 必要的程式碼修改

### 1. 移除 MinIO 依賴

```typescript
// composables/useStorage.ts
export const useStorage = () => {
  const uploadToCloud = async (file: File) => {
    // 使用 Cloudinary/Supabase/Firebase
    const formData = new FormData()
    formData.append('file', file)
    
    return await $fetch('/api/upload', {
      method: 'POST',
      body: formData
    })
  }
  
  return { uploadToCloud }
}
```

### 2. 使用環境變數切換存儲

```typescript
// server/api/upload.post.ts
const storageProvider = process.env.STORAGE_PROVIDER || 'minio'

switch(storageProvider) {
  case 'supabase':
    return await uploadToSupabase(file)
  case 'cloudinary':
    return await uploadToCloudinary(file)
  case 'firebase':
    return await uploadToFirebase(file)
  default:
    return await uploadToMinIO(file)
}
```

## 📊 方案比較

| 方案 | 免費額度 | 適合場景 | 複雜度 |
|------|----------|----------|--------|
| Netlify + Supabase | 100GB/月 | 中小型活動 | ⭐⭐ |
| Vercel + Cloudinary | 25GB 存儲 | 照片為主 | ⭐⭐⭐ |
| GitHub + Firebase | 5GB 存儲 | 小型活動 | ⭐⭐⭐ |
| Oracle Cloud VPS | 永久免費 | 完整控制 | ⭐⭐⭐⭐ |

## 💡 建議

1. **短期使用（3個月）**: 
   - 使用 Netlify + Supabase
   - 簡單快速，夠用

2. **想要完整功能**:
   - Oracle Cloud Free VPS
   - 可以直接用現有 Docker 配置

3. **最簡單方案**:
   - 靜態生成 + GitHub Pages
   - 犧牲部分即時功能

需要我幫您實作哪個方案嗎？