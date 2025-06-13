# 🎊 Nuxt 3 Wedding Wall 婚禮祝福牆

一個使用 Nuxt 3、Element Plus 與 MinIO 打造的現代化婚禮祝福牆相簿系統。

## ✨ 主要功能

### 🎊 **多樣化祝福牆風格**
- **經典祝福牆** - 傳統輪播模式，穩重典雅
- **Instagram 風格** - 社群媒體風格，愛心互動
- **Stories 風格** - 動態故事般體驗，手機比例
- **Magazine 風格** - 雜誌排版精緻感
- **Polaroid 風格** - 復古拍立得質感，3D 輪播

### 💻 **現代化管理系統**
- 🛡️ **智能審核系統** - 自動/手動審核，關鍵字過濾
- ⚙️ **管理員控制台** - 統一管理留言、設定、背景
- 📊 **統計儀表板** - 留言統計、審核狀態總覽
- 🎨 **自訂背景** - 支援上傳婚禮照片作為祝福牆背景

### 📱 **優質使用體驗**
- 📱 **響應式設計** - 支援手機、平板、桌面裝置
- 🖼️ **圖片上傳** - 支援 JPG/PNG/GIF 格式，檔案驗證
- 💬 **祝福留言** - 限制 50 字，防止過長內容
- 🎠 **自動輪播** - 可調整播放速度，圖片額外停留時間
- 🖼️ **相簿瀏覽** - 燈箱式圖片瀏覽與批量下載
- ⚡ **即時更新** - 新上傳的內容即時顯示

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
| `/` | 現代化首頁 | 功能導覽、風格預覽、使用指南 |
| `/upload` | 上傳表單 | 訪客上傳祝福與照片（含姓名輸入） |
| `/wall` | 經典祝福牆 | 傳統輪播模式，婚禮現場展示 |
| `/wall-styles` | 風格選擇 | 多種祝福牆風格選擇頁面 |
| `/wall-enhanced` | Instagram 風格 | 社群媒體風格，愛心互動 |
| `/wall-stories` | Stories 風格 | 手機比例，動態故事體驗 |
| `/wall-magazine` | Magazine 風格 | 雜誌排版，精緻展示 |
| `/wall-polaroid` | Polaroid 風格 | 復古拍立得，3D coverflow 效果 |
| `/gallery` | 相簿瀏覽 | 瀏覽所有照片，批量下載 |
| `/admin` | 管理控制台 | 留言審核、系統設定、背景管理 |

## 🏗️ 技術架構

### 前端技術棧
- **Nuxt 3** - Vue.js 全端框架，SSR/SPA
- **Element Plus** - Vue 3 UI 組件庫
- **TypeScript** - 類型安全的 JavaScript
- **Swiper.js** - 輪播與特效組件
- **vue3-photo-preview** - 圖片燈箱組件
- **Pinia** - 狀態管理

### 後端 & 儲存
- **Nuxt 3 Server API** - 內建伺服器端 API
- **MinIO** - S3 相容的物件儲存
- **Formidable** - 檔案上傳處理
- **Docker Compose** - 容器化部署

### 智能審核系統
1. **自動審核** - 根據管理員設定決定新留言狀態
2. **關鍵字過濾** - 自動通過/拒絕包含特定關鍵字的留言
3. **手動審核** - 管理員可在控制台手動審核留言
4. **顯示控制** - 可選擇是否在祝福牆顯示待審核留言

### 資料流程
1. 使用者透過 `/upload` 頁面上傳照片和祝福
2. 檔案儲存至 MinIO bucket: `wedding-wall/`
3. 訊息 metadata 存為 JSON: `wedding-wall/metadata/*.json`
4. 根據審核設定決定留言顯示狀態
5. 各種風格祝福牆根據設定輪播已審核內容
6. 管理員可透過 `/admin` 管理所有設定和留言

## 💡 程式碼優化亮點

### 🔄 **程式碼重用**
- `useMessages.ts` - 訊息狀態管理與 API 整合
- `useBackgroundStore.ts` - 背景圖片狀態管理
- `useUIStore.ts` - 統一 UI 通知系統
- `useMinio.ts` - 檔案操作工具函數

### 🛡️ **安全機制**
- 智能審核系統防止不當內容
- 客戶端檔案驗證（類型、大小限制）
- 伺服器端安全檢查（路徑遍歷防護）
- 留言長度限制（50 字元）

### 🎨 **使用者體驗**
- 現代化首頁設計，功能導覽清晰
- 多種祝福牆風格，滿足不同場景
- 管理員控制台，統一管理界面
- 響應式設計，完美適配各種裝置
- 實時預覽與即時回饋

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
├── components/              # Vue 組件
│   ├── BackgroundUpload.vue # 背景上傳組件
│   ├── MessageCard.vue     # 訊息卡片
│   ├── UploadForm.vue      # 上傳表單
│   ├── InstagramPost.vue   # Instagram 風格貼文
│   ├── StoriesPost.vue     # Stories 風格貼文
│   ├── MagazinePost.vue    # Magazine 風格貼文
│   ├── PolaroidPost.vue    # Polaroid 風格貼文
│   └── WallStyleSelector.vue # 風格選擇器
├── composables/             # Vue Composables
│   ├── useMessages.ts      # 訊息管理與 API
│   ├── useAuth.ts          # 身份驗證
│   └── useMinio.ts         # 檔案工具
├── stores/                  # Pinia 狀態管理
│   ├── background.ts       # 背景狀態
│   ├── upload.ts           # 上傳狀態
│   └── ui.ts               # UI 狀態
├── pages/                   # 頁面路由
│   ├── index.vue           # 現代化首頁
│   ├── upload.vue          # 上傳頁
│   ├── wall.vue            # 經典祝福牆
│   ├── wall-styles.vue     # 風格選擇
│   ├── wall-enhanced.vue   # Instagram 風格
│   ├── wall-stories.vue    # Stories 風格
│   ├── wall-magazine.vue   # Magazine 風格
│   ├── wall-polaroid.vue   # Polaroid 風格
│   ├── gallery.vue         # 相簿
│   └── admin.vue           # 管理控制台
├── server/                  # 伺服器端
│   ├── api/                # API 端點
│   │   ├── admin/          # 管理員 API
│   │   │   ├── settings.get.ts    # 讀取設定
│   │   │   ├── settings.post.ts   # 儲存設定
│   │   │   ├── messages.get.ts    # 管理員訊息
│   │   │   └── approve.post.ts    # 審核操作
│   │   ├── upload.post.ts  # 上傳處理（含審核邏輯）
│   │   ├── messages.get.ts # 訊息 API（含過濾）
│   │   └── wall-background.ts # 背景管理
│   └── utils/              # 工具函數
└── plugins/                # Nuxt 插件
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
  "timestamp": 1640995200000,
  "approved": "approved"
}
```

### 管理員設定結構
```json
{
  "autoApprove": false,
  "showUnmoderated": false,
  "autoApproveKeywords": "祝福,恭喜,幸福",
  "autoRejectKeywords": "垃圾,廣告,不當",
  "wallTitle": "婚禮祝福牆",
  "wallSubtitle": "分享美好瞬間",
  "titleColor": "#2c3e50",
  "autoplayDelay": 3,
  "imageDelay": 1,
  "lastUpdated": "2024-01-01T12:00:00.000Z"
}
```

### MinIO 儲存結構
```
wedding-wall/
├── 1640995200000-photo1.jpg       # 圖片檔案
├── 1640995300000-photo2.png       # 圖片檔案
├── background-1640995400000.jpg    # 背景圖片
├── admin-settings.json             # 管理員設定
└── metadata/                       # 訊息 metadata
    ├── 1640995200000-uuid1.json   # 留言資料（含審核狀態）
    └── 1640995300000-uuid2.json   # 留言資料（含審核狀態）
```

## 🛠️ 進階自訂

### 透過管理控制台設定
訪問 `/admin` 頁面可進行以下設定：

#### 📋 **審核設定**
- **自動審核** - 新留言是否自動通過審核
- **顯示未審核** - 祝福牆是否顯示待審核留言
- **自動通過關鍵字** - 包含特定關鍵字自動通過
- **自動拒絕關鍵字** - 包含特定關鍵字自動拒絕

#### 🎨 **外觀設定**
- **祝福牆標題** - 自訂祝福牆標題與副標題
- **標題顏色** - 自訂標題顏色
- **自訂背景** - 上傳婚禮照片作為祝福牆背景

#### ⏱️ **播放設定**
- **自動播放延遲** - 調整祝福輪播間隔時間
- **圖片額外時間** - 有圖片的留言額外停留時間

### 程式碼層級自訂

#### 自訂檔案大小限制
編輯 `server/api/upload.post.ts`：
```javascript
// 將 10MB 改為你想要的限制
const maxSize = 10 * 1024 * 1024 // ← 修改此數值
```

#### 自訂留言長度限制
編輯 `server/api/upload.post.ts`：
```javascript
// 將 50 字改為你想要的限制
if (text.length > 50) { // ← 修改此數值
  throw createError({
    statusCode: 400,
    statusMessage: '祝福內容不能超過50字'
  })
}
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
