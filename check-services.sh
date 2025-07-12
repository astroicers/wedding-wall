#!/bin/bash

echo "🎊 Wedding Wall 服務狀態檢查"
echo "================================"

# 檢查 MinIO 容器
echo "📦 檢查 MinIO 容器..."
if docker ps | grep -q "wedding-wall-minio"; then
    echo "✅ MinIO 容器正在運行"
else
    echo "❌ MinIO 容器未運行"
fi

# 檢查 MinIO Console
echo "🖥️  檢查 MinIO Console..."
if curl -s -I http://localhost:9001 | grep -q "200 OK"; then
    echo "✅ MinIO Console 可訪問: http://localhost:9001"
    echo "   👤 帳號: admin"
    echo "   🔑 密碼: admin123"
else
    echo "❌ MinIO Console 無法訪問"
fi

# 檢查 Wedding Wall 應用程式
echo "💒 檢查 Wedding Wall 應用程式..."
if curl -s -I http://localhost:3000 | grep -q "200 OK"; then
    echo "✅ Wedding Wall 應用程式可訪問: http://localhost:3000"
else
    echo "❌ Wedding Wall 應用程式無法訪問"
fi

# 檢查 API 端點
echo "🔌 檢查 API 端點..."
if curl -s http://localhost:3000/api/metadata >/dev/null; then
    echo "✅ API 端點正常運作"
else
    echo "❌ API 端點異常"
fi

echo ""
echo "🎉 服務狀態檢查完成！"
echo ""
echo "📝 下一步："
echo "1. 開啟 http://localhost:3000 開始使用祝福牆"
echo "2. 開啟 http://localhost:9001 進入 MinIO 管理台"
echo "3. 可以使用 docker-compose down 停止所有服務"