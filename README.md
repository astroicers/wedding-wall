# Nuxt 3 Wedding Wall 相簿專案

這是一個使用 Nuxt 3、Element Plus 與 MinIO 打造的婚禮祝福牆相簿系統，支援：
- 使用者上傳祝福與照片
- 照片與留言存入 MinIO
- 即時輪播顯示祝福牆畫面
- 圖片瀏覽相簿與下載功能

---

## 📦 安裝依賴套件

```bash
npm install minio formidable element-plus @element-plus/nuxt vue3-photo-preview
```

---

## 🚀 啟動 MinIO 伺服器（本地開發用）

```bash
docker run -p 9000:9000 -p 9001:9001 \
  -e "MINIO_ROOT_USER=admin" \
  -e "MINIO_ROOT_PASSWORD=admin123" \
  -v $(pwd)/minio-data:/data \
  quay.io/minio/minio server /data --console-address ":9001"
```

- MinIO Console: http://localhost:9001
- Access Key: `admin`
- Secret Key: `admin123`

請建立一個名為 `wedding-wall` 的 bucket。

---

## 🛠️ 開發與啟動 Nuxt 3 專案

```bash
npm run dev
```

---

## 📸 重要路由

| 頁面 | 說明 |
|------|------|
| `/` | 登入與留言上傳入口頁面 |
| `/upload` | 使用者上傳祝福與圖片的表單頁面 |
| `/wall` | 自動播放祝福牆畫面（輪播所有留言）|
| `/gallery` | 使用者相簿瀏覽與圖片放大、下載功能 |

---

## 📂 plugins/photo-preview.client.ts

使用 `vue3-photo-preview` 作為圖像瀏覽燈箱：
```ts
import { defineNuxtPlugin } from '#app'
import PhotoPreview from 'vue3-photo-preview'
import 'vue3-photo-preview/dist/index.css'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(PhotoPreview)
})
```

若無自動載入，請記得加入 `nuxt.config.ts`：
```ts
export default defineNuxtConfig({
  plugins: ['~/plugins/photo-preview.client']
})
```

---

## 📁 專案資料存取架構（MinIO）
- `/wedding-wall/*.jpg` → 使用者上傳圖片
- `/wedding-wall/metadata/*.json` → 每一則留言的 JSON 檔案，內容包含：name、text、photo URL

---

## ✅ 待辦與擴充
- [ ] 加入後台打包所有圖片 ZIP
- [ ] 權限保護與管理者登入
- [ ] 留言搜尋與過濾功能

---

> 本專案旨在打造簡單又溫馨的婚禮互動祝福系統，歡迎自由擴充應用於各類活動場合。
