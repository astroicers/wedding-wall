# 🚀 Wedding Wall 快速運行指南

## 一鍵啟動

```bash
# 啟動所有服務
./start-services.sh

# 檢查服務狀態
./check-services.sh

# 停止所有服務
./stop-services.sh
```

## 手動運行

### 1. 啟動 MinIO

```bash
# 使用 Docker Compose
docker-compose -f docker-compose-simple.yml up -d

# 或使用單一 Docker 指令
docker run -d --name wedding-wall-minio \
  -p 9000:9000 -p 9001:9001 \
  -e "MINIO_ROOT_USER=admin" \
  -e "MINIO_ROOT_PASSWORD=admin123" \
  -v minio-data:/data \
  quay.io/minio/minio server /data --console-address ":9001"
```

### 2. 建置並啟動應用程式

```bash
# 建置
npm run build

# 啟動
node .output/server/index.mjs
```

## 訊

| 服務 | URL | 說明 |
|------|-----|------|
| Wedding Wall | http://localhost:3000 | 主要應用程式 |
| MinIO Console | http://localhost:9001 | 檔案管理介面 |
| MinIO API | http://localhost:9000 | 物件儲存 API |

### MinIO 登入資訊
- 帳號: `admin`
- 密碼: `admin123`

## 開發模式

```bash
# 開發模式（熱重載）
npm run dev
```

## 故障排除

### MinIO 無法啟動
```bash
# 檢查 Docker 是否運行
docker --version

# 檢查連接埠是否被占用
lsof -i :9000
lsof -i :9001
```

### 應用程式無法連接 MinIO
```bash
# 檢查 MinIO 容器狀態
docker ps | grep minio

# 檢查 MinIO 日誌
docker logs wedding-wall-minio
```

### 清理並重新開始
```bash
# 停止所有服務
./stop-services.sh

# 清理 Docker 容器和資料
docker rm -f wedding-wall-minio
docker volume rm wedding-wall_minio_data

# 重新啟動
./start-services.sh
```

## 資料備份

```bash
# 備份 MinIO 資料
docker run --rm -v wedding-wall_minio_data:/data -v $(pwd):/backup alpine tar czf /backup/minio-backup.tar.gz -C /data .

# 還原 MinIO 資料
docker run --rm -v wedding-wall_minio_data:/data -v $(pwd):/backup alpine tar xzf /backup/minio-backup.tar.gz -C /data
```