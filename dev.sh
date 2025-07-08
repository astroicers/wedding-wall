#!/bin/bash

# 婚禮祝福牆開發腳本

case "$1" in
  "start"|"up")
    echo "🚀 啟動開發環境..."
    docker-compose -f docker-compose.dev.yml up -d
    echo "✅ 開發環境啟動完成！"
    echo "📱 應用: http://localhost:3000"
    echo "🗄️  MinIO: http://localhost:9001 (admin/admin123)"
    ;;
  "stop"|"down")
    echo "🛑 停止開發環境..."
    docker-compose -f docker-compose.dev.yml down
    echo "✅ 開發環境已停止"
    ;;
  "restart")
    echo "🔄 重啟開發環境..."
    docker-compose -f docker-compose.dev.yml down
    docker-compose -f docker-compose.dev.yml up -d
    echo "✅ 開發環境重啟完成！"
    ;;
  "logs")
    echo "📋 查看應用日誌..."
    docker-compose -f docker-compose.dev.yml logs -f wedding-wall-dev
    ;;
  "build")
    echo "🔨 重新建置開發映像..."
    docker-compose -f docker-compose.dev.yml build --no-cache wedding-wall-dev
    echo "✅ 建置完成！"
    ;;
  "clean")
    echo "🧹 清理開發環境..."
    docker-compose -f docker-compose.dev.yml down -v --remove-orphans
    docker system prune -f
    echo "✅ 清理完成！"
    ;;
  "prod")
    echo "🚀 啟動生產環境..."
    docker-compose down 2>/dev/null || true
    docker-compose up --build -d
    echo "✅ 生產環境啟動完成！"
    ;;
  *)
    echo "🎊 婚禮祝福牆開發工具"
    echo ""
    echo "使用方法: ./dev.sh [command]"
    echo ""
    echo "開發命令:"
    echo "  start     啟動開發環境 (支援熱重載)"
    echo "  stop      停止開發環境"
    echo "  restart   重啟開發環境"
    echo "  logs      查看應用日誌"
    echo "  build     重新建置映像 (需要更新依賴時)"
    echo "  clean     清理所有容器和映像"
    echo ""
    echo "生產命令:"
    echo "  prod      啟動生產環境 (需要重新建置)"
    echo ""
    echo "💡 開發時建議使用 start，只有更新依賴時才用 build"
    ;;
esac