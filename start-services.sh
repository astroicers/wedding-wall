#!/bin/bash

echo "🚀 啟動 Wedding Wall 服務..."
echo "============================="

# 停止現有服務
echo "🛑 停止現有服務..."
pkill -f "node .output/server/index.mjs" || true
docker stop wedding-wall-minio 2>/dev/null || true
docker rm wedding-wall-minio 2>/dev/null || true

# 啟動 MinIO
echo "📦 啟動 MinIO..."
docker-compose -f docker-compose-simple.yml up -d

# 等待 MinIO 啟動
echo "⏳ 等待 MinIO 啟動..."
sleep 5

# 建置應用程式
echo "🔨 建置應用程式..."
npm run build

# 啟動應用程式
echo "💒 啟動 Wedding Wall 應用程式..."
node .output/server/index.mjs &

# 等待應用程式啟動
echo "⏳ 等待應用程式啟動..."
sleep 3

# 檢查服務狀態
echo ""
./check-services.sh