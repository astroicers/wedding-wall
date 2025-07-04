# Google OAuth 2.0 設定指南

本指南將協助您設定 Google OAuth 2.0 以啟用 Google 登入功能。

## 步驟 1：建立 Google Cloud 專案

1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 如果是第一次使用，同意服務條款
3. 點擊頂部的專案選擇器（專案名稱旁的下拉箭頭）
4. 點擊「新增專案」
5. 輸入專案資訊：
   - **專案名稱**：Wedding Wall（或您喜歡的名稱）
   - **位置**：保持預設（無組織）
6. 點擊「建立」

## 步驟 2：啟用 Google+ API

1. 在 Google Cloud Console 中，前往左側選單
2. 點擊「API 和服務」→「程式庫」
3. 搜尋「Google+ API」
4. 點擊搜尋結果中的「Google+ API」
5. 點擊「啟用」按鈕

> 注意：Google+ API 雖然已經停用社交功能，但仍用於 OAuth 登入

## 步驟 3：設定 OAuth 同意畫面

1. 在左側選單點擊「API 和服務」→「OAuth 同意畫面」
2. 選擇使用者類型：
   - **外部**：允許任何 Google 帳戶登入（推薦用於測試）
   - **內部**：僅限您的 Google Workspace 組織（如果有的話）
3. 點擊「建立」
4. 填寫應用程式資訊：
   - **應用程式名稱**：Wedding Wall
   - **使用者支援電子郵件**：選擇您的 email
   - **應用程式標誌**：（可選）上傳您的 logo
   - **應用程式首頁**：http://localhost:3000（開發環境）
   - **應用程式隱私權政策連結**：可留空（測試用）
   - **應用程式服務條款連結**：可留空（測試用）
   - **授權網域**：localhost（點擊「新增網域」）
   - **開發人員聯絡資訊**：輸入您的 email
5. 點擊「儲存並繼續」
6. 在「範圍」頁面，點擊「新增或移除範圍」
7. 選擇以下範圍：
   - `openid`
   - `email`
   - `profile`
8. 點擊「更新」→「儲存並繼續」
9. 在「測試使用者」頁面，可以新增測試帳號（可選）
10. 點擊「儲存並繼續」
11. 檢視摘要，點擊「返回資訊主頁」

## 步驟 4：建立 OAuth 2.0 憑證

1. 點擊「API 和服務」→「憑證」
2. 點擊頂部的「建立憑證」→「OAuth 用戶端 ID」
3. 填寫資訊：
   - **應用程式類型**：網頁應用程式
   - **名稱**：Wedding Wall Web Client
   - **已授權的 JavaScript 來源**：
     - http://localhost:3000
     - http://localhost:3001（備用）
   - **已授權的重新導向 URI**：
     - http://localhost:3000/auth/callback
     - http://localhost:3001/auth/callback（備用）
4. 點擊「建立」
5. 會彈出一個視窗顯示您的憑證：
   - **用戶端 ID**：複製此值
   - **用戶端密碼**：複製此值（請妥善保管！）
6. 點擊「確定」

## 步驟 5：設定環境變數

### 自動化設定（推薦）

1. 執行自動設定腳本：
```bash
node scripts/setup-env.js
```

這會自動：
- 創建 `.env` 檔案
- 生成安全的 JWT Secret
- 設定預設值

2. 然後只需編輯 `.env` 檔案，填入您的 Google OAuth 憑證：
```env
GOOGLE_CLIENT_ID=您的用戶端ID.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=您的用戶端密碼
```

### 手動設定

如果您偏好手動設定：

1. 複製範例檔案：
```bash
cp .env.example .env
```

2. 生成 JWT Secret：
```bash
node scripts/generate-jwt-secret.js
```

3. 編輯 `.env` 檔案，填入所有憑證

## 步驟 6：測試登入流程

1. 啟動完整服務（包含 MinIO）：
```bash
docker-compose up --build
```

2. 等待服務啟動完成，確認以下服務正在運行：
   - Nuxt 應用：http://localhost:3000
   - MinIO Console：http://localhost:9001

3. 開啟瀏覽器訪問：http://localhost:3000/auth/login

4. 點擊「使用 Google 帳號登入」

5. 應該會導向到 Google 登入頁面

6. 選擇您的 Google 帳號並授權

7. 成功後會導向到 `/auth/callback`，然後自動跳轉到用戶墻列表頁

## 常見問題

### 1. 錯誤：redirect_uri_mismatch
**原因**：重新導向 URI 不符合
**解決**：確保 Google Console 中的「已授權的重新導向 URI」包含 `http://localhost:3000/auth/callback`

### 2. 錯誤：invalid_client
**原因**：用戶端 ID 或密碼錯誤
**解決**：檢查 `.env` 檔案中的憑證是否正確

### 3. 錯誤：access_denied
**原因**：使用者拒絕授權
**解決**：這是正常的使用者行為，需要處理這種情況

### 4. 本地開發 HTTPS 問題
如果需要 HTTPS，可以使用 mkcert：
```bash
# 安裝 mkcert
brew install mkcert  # macOS
# 或查看 https://github.com/FiloSottile/mkcert 其他平台安裝方式

# 生成憑證
mkcert -install
mkcert localhost
```

然後在 `nuxt.config.ts` 中配置：
```typescript
export default defineNuxtConfig({
  devServer: {
    https: {
      key: './localhost-key.pem',
      cert: './localhost.pem'
    }
  }
})
```

## 生產環境部署

部署到生產環境時：

1. 在 Google Console 更新授權的重新導向 URI：
   - https://your-domain.com/auth/callback

2. 更新環境變數：
   - `APP_URL=https://your-domain.com`

3. 確保 JWT_SECRET 是一個強密鑰

4. 考慮將 OAuth 同意畫面從測試模式改為生產模式

## 安全建議

1. **永遠不要**將 `.env` 檔案提交到版本控制
2. 使用強密碼作為 JWT_SECRET
3. 在生產環境使用 HTTPS
4. 定期輪換密鑰
5. 監控異常登入活動

## 下一步

完成設定後，您可以：
1. 測試完整的登入流程
2. 實作用戶資料管理
3. 開發多墻功能
4. 整合更多 SSO 提供者（如 Keycloak）