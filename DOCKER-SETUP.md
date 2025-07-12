# 🐳 Docker Hub 自動發布設置

這個 GitHub Actions 工作流程會在你推送 tags 時自動構建並發布 Docker 映像到 Docker Hub。

## 🔧 設置步驟

### 1. 在 Docker Hub 創建倉庫
1. 登入 [Docker Hub](https://hub.docker.com)
2. 點擊 "Create Repository"
3. 倉庫名稱設為: `wedding-wall` 或你想要的名稱
4. 設為 Public（或 Private，看你的需求）

### 2. 獲取 Docker Hub 存取權限
1. 在 Docker Hub 頭像 → Account Settings → Security
2. 點擊 "New Access Token"
3. 名稱: `github-actions-wedding-wall`
4. 權限: `Read, Write, Delete`
5. 複製生成的 token（只會顯示一次！）

### 3. 在 GitHub 設置 Secrets
1. 前往你的 GitHub 倉庫
2. Settings → Secrets and variables → Actions
3. 點擊 "New repository secret"
4. 添加兩個 secrets：

```
Name: DOCKER_USERNAME
Value: 你的 Docker Hub 用戶名

Name: DOCKER_PASSWORD  
Value: 剛才生成的 Access Token
```

## 🚀 使用方法

### 觸發自動發布
當你推送 tags 時會自動觸發：

```bash
# 創建並推送 tag
git tag v1.2.0 -m "Release v1.2.0"
git push origin v1.2.0

# 或者創建 pre-release
git tag v1.2.0-beta -m "Beta release"
git push origin v1.2.0-beta
```

### 生成的映像標籤
工作流程會自動生成多個標籤：
- `astroicers/wedding-wall:v1.2.0` (完整版本)
- `astroicers/wedding-wall:1.2` (主要.次要版本)
- `astroicers/wedding-wall:1` (主要版本)
- `astroicers/wedding-wall:latest` (最新穩定版)

## 📦 映像特性

### 多平台支持
- `linux/amd64` (x86_64)
- `linux/arm64` (ARM 架構，如 Apple M1)

### 映像標籤
每個映像都包含完整的元數據：
- 版本信息
- 構建時間
- Git commit SHA
- 授權信息

### 緩存優化
- 使用 GitHub Actions cache
- 加速重複構建
- 節省構建時間

## 🔍 查看構建狀態

### GitHub Actions
1. 前往你的倉庫
2. 點擊 "Actions" 標籤
3. 查看 "🐳 Docker Build & Push" 工作流程

### Docker Hub
1. 前往你的 Docker Hub 倉庫
2. 查看 "Tags" 標籤
3. 確認新映像已發布

## 🎯 使用發布的映像

### 快速啟動
```bash
# 使用最新版本
docker run -p 3000:3000 astroicers/wedding-wall:latest

# 使用特定版本
docker run -p 3000:3000 astroicers/wedding-wall:v1.2.0
```

### Docker Compose
```yaml
version: '3.8'
services:
  wedding-wall:
    image: astroicers/wedding-wall:latest
    ports:
      - "3000:3000"
```

## 🔧 自定義配置

### 修改映像名稱
編輯 `.github/workflows/docker-publish.yml`:
```yaml
env:
  REGISTRY: docker.io
  IMAGE_NAME: 你的用戶名/你的倉庫名
```

### 修改觸發條件
```yaml
on:
  push:
    tags:
      - 'v*.*.*'        # 只有 v1.0.0 格式
      - 'release-*'     # 或 release-xxx 格式
```

### 添加更多平台
```yaml
platforms: linux/amd64,linux/arm64,linux/arm/v7
```

## ⚠️ 注意事項

1. **保護 Secrets**: 絕不要在代碼中暴露 Docker Hub credentials
2. **Tag 格式**: 必須符合 `v*.*.*` 格式才會觸發
3. **構建時間**: 首次構建可能需要 3-5 分鐘
4. **Storage Quota**: 注意 Docker Hub 的存儲限制

## 🎉 測試工作流程

創建一個測試 tag 來驗證設置：
```bash
git tag v1.1.1-test -m "Test Docker Hub integration"
git push origin v1.1.1-test
```

然後檢查：
1. GitHub Actions 是否成功運行
2. Docker Hub 是否出現新映像
3. 映像是否可以正常下載和運行