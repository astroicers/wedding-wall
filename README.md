# 🎊 Nuxt 3 Wedding Wall 婚禮祝福牆

一個使用 Nuxt 3、Element Plus 與 MinIO 打造的現代化婚禮祝福牆相簿系統。

## ✨ 主要功能

- 📱 **響應式設計** - 支援手機、平板、桌面裝置
- 🖼️ **圖片上傳** - 支援 JPG/PNG/GIF/WebP 格式，最大 5MB
- 💬 **祝福留言** - 訪客可留下祝福文字搭配照片
- 🎠 **自動輪播** - 祝福牆頁面自動輪播展示所有訊息
- 🖼️ **相簿瀏覽** - 燈箱式圖片瀏覽與下載功能
- ⚡ **即時更新** - 新上傳的內容即時顯示
- 🔒 **檔案驗證** - 客戶端檔案類型與大小驗證

## 🚀 快速開始

### 1. 安裝依賴

```bash
npm install
```

### 2. 啟動 MinIO 儲存服務

使用 Docker 啟動 MinIO 伺服器：

```bash
docker run -p 9000:9000 -p 9001:9001 \
  -e "MINIO_ROOT_USER=admin" \
  -e "MINIO_ROOT_PASSWORD=admin123" \
  -v $(pwd)/minio-data:/data \
  quay.io/minio/minio server /data --console-address ":9001"
```

**MinIO 設定資訊：**
- 🌐 MinIO Console: http://localhost:9001
- 🔑 Access Key: `admin`
- 🔐 Secret Key: `admin123`

### 3. 建立 MinIO Bucket

1. 開啟 MinIO Console (http://localhost:9001)
2. 使用上述帳號密碼登入
3. 建立名為 `wedding-wall` 的 bucket
4. 設定 bucket 為 public read（可選）

### 4. 啟動開發伺服器

```bash
npm run dev
```

應用程式將在 http://localhost:3000 啟動

## 🧭 頁面導覽

| 路徑 | 功能說明 | 使用場景 |
|------|----------|----------|
| `/` | 登入與首頁 | 訪客進入點，簡單身份驗證 |
| `/upload` | 上傳表單 | 訪客上傳祝福與照片 |
| `/wall` | 祝福牆輪播 | 婚禮現場大螢幕展示 |
| `/gallery` | 相簿瀏覽 | 瀏覽所有上傳的照片 |

## 🏗️ 技術架構

### 前端技術棧
- **Nuxt 3** - Vue.js 全端框架
- **Element Plus** - Vue 3 UI 組件庫
- **TypeScript** - 類型安全的 JavaScript
- **vue3-photo-preview** - 圖片燈箱組件

### 後端 & 儲存
- **Nuxt 3 Server API** - 內建伺服器端 API
- **MinIO** - S3 相容的物件儲存
- **Formidable** - 檔案上傳處理

### 資料流程
1. 使用者透過 `/upload` 頁面上傳照片和祝福
2. 檔案儲存至 MinIO bucket: `wedding-wall/`
3. 訊息 metadata 存為 JSON: `wedding-wall/metadata/*.json`
4. `/wall` 頁面每 3 秒輪播，每 5 秒更新內容
5. `/gallery` 頁面展示所有照片的網格檢視

## 💡 程式碼優化亮點

### 🔄 **程式碼重用**
- `useApi.ts` - 統一 API 請求處理
- `useMessages.ts` - 訊息狀態管理
- `useMinio.ts` - 檔案操作工具函數

### 🛡️ **錯誤處理**
- 統一使用 Element Plus 訊息通知
- 客戶端檔案驗證（類型、大小）
- 伺服器端安全檢查（路徑遍歷防護）

### 🎨 **使用者體驗**
- 上傳前圖片預覽
- Loading 狀態指示
- 檔案大小與類型友善提示
- 響應式設計適配各種螢幕

## 🔧 開發指令

```bash
# 開發伺服器
npm run dev

# 建置專案
npm run build

# 預覽建置結果
npm run preview

# 產生靜態站點
npm run generate

# TypeScript 類型檢查
npx nuxi typecheck
```

## 📁 專案結構

```
wedding-wall/
├── components/          # Vue 組件
│   ├── AuthPanel.vue   # 登入面板
│   ├── MessageCard.vue # 訊息卡片
│   └── UploadForm.vue  # 上傳表單
├── composables/         # Vue Composables
│   ├── useApi.ts       # API 請求工具
│   ├── useAuth.ts      # 身份驗證
│   ├── useMessages.ts  # 訊息管理
│   └── useMinio.ts     # 檔案工具
├── pages/              # 頁面路由
│   ├── index.vue       # 首頁
│   ├── upload.vue      # 上傳頁
│   ├── wall.vue        # 祝福牆
│   └── gallery.vue     # 相簿
├── server/             # 伺服器端
│   ├── api/            # API 端點
│   └── utils/          # 工具函數
└── plugins/            # Nuxt 插件
    └── photo-preview.client.ts
```

## ⚙️ 環境變數設定

你可以建立 `.env` 檔案來自訂 MinIO 連線設定：

```env
# MinIO 設定
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=admin
MINIO_SECRET_KEY=admin123
MINIO_BUCKET_NAME=wedding-wall
```

## 🚀 部署說明

### 使用 Docker Compose

建立 `docker-compose.yml`：

```yaml
version: '3.8'
services:
  minio:
    image: quay.io/minio/minio
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      MINIO_ROOT_USER: admin
      MINIO_ROOT_PASSWORD: admin123
    volumes:
      - minio_data:/data
    command: server /data --console-address ":9001"

  wedding-wall:
    build: .
    ports:
      - "3000:3000"
    environment:
      MINIO_ENDPOINT: minio
      MINIO_PORT: 9000
    depends_on:
      - minio

volumes:
  minio_data:
```

啟動服務：
```bash
docker-compose up -d
```

### 建置 Docker 映像

建立 `Dockerfile`：

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## 📱 使用說明

### 👥 給訪客的使用流程

1. **進入首頁** - 訪問 `http://localhost:3000`
2. **身份驗證** - 輸入姓名或選擇社群媒體登入
3. **上傳祝福** - 選擇照片、輸入祝福文字後送出
4. **瀏覽相簿** - 點擊 "相簿" 查看所有上傳的照片

### 🎥 給婚禮主辦的建議

1. **大螢幕展示** - 將 `/wall` 頁面投影在婚禮現場
2. **QR Code 分享** - 製作 QR Code 讓賓客掃描上傳
3. **即時互動** - 鼓勵賓客在婚禮進行中上傳照片
4. **事後回憶** - 婚禮結束後透過 `/gallery` 下載所有照片

## 🔧 常見問題

### Q: MinIO 連線失敗？
A: 確認 Docker 容器正在運行，檢查連接埠 9000 和 9001 是否被占用。

### Q: 無法上傳檔案？
A: 檢查檔案格式（僅支援圖片）和大小（最大 5MB）。

### Q: 祝福牆沒有顯示內容？
A: 確認 MinIO bucket `wedding-wall` 已建立且有上傳的內容。

### Q: 如何更改 MinIO 設定？
A: 修改環境變數或直接編輯 `server/utils/minio.ts`。

## 📝 資料格式

### 訊息 Metadata 結構
```json
{
  "name": "張三",
  "text": "新婚快樂！祝福你們百年好合！",
  "photo": "/api/image/1640995200000-photo.jpg",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### MinIO 儲存結構
```
wedding-wall/
├── 1640995200000-photo1.jpg    # 圖片檔案
├── 1640995300000-photo2.png    # 圖片檔案
└── metadata/                   # 訊息 metadata
    ├── 1640995200000-uuid1.json
    └── 1640995300000-uuid2.json
```

## 🛠️ 進階自訂

### 修改輪播間隔
編輯 `pages/wall.vue`：
```javascript
// 將 3 秒改為你想要的間隔（毫秒）
setInterval(() => {
  // 輪播邏輯
}, 3000) // ← 修改此數值
```

### 自訂檔案大小限制
編輯 `components/UploadForm.vue`：
```javascript
// 將 5MB 改為你想要的限制
const maxSize = 5 * 1024 * 1024 // ← 修改此數值
```

### 添加更多檔案格式
編輯 `composables/useMinio.ts`：
```javascript
const allowedTypes = [
  'image/jpeg', 'image/jpg', 'image/png', 
  'image/gif', 'image/webp'
  // 添加更多格式...
]
```

---

## 🎊 專案特色

✨ **零設定啟動** - 只需 Docker 和 npm install  
🎨 **美觀介面** - Element Plus 現代化設計  
📱 **行動優先** - 響應式設計，手機體驗佳  
⚡ **即時更新** - 上傳後立即在祝福牆顯示  
🔒 **安全可靠** - 檔案驗證與路徑保護  
🚀 **效能優化** - 圖片快取與錯誤恢復  

> 💝 本專案致力於為每對新人打造最溫馨難忘的婚禮互動體驗！
