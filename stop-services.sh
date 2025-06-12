#!/bin/bash

echo "🛑 停止 Wedding Wall 服務..."
echo "============================="

# 停止 Nuxt 應用程式
echo "💒 停止 Wedding Wall 應用程式..."
pkill -f "node .output/server/index.mjs" || true

# 停止 MinIO
echo "📦 停止 MinIO..."
docker-compose -f docker-compose-simple.yml down

echo "✅ 所有服務已停止"