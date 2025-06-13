#!/bin/bash

# 停止佔用端口的進程
echo "正在清理端口..."
fuser -k 3000/tcp 2>/dev/null || true
fuser -k 3001/tcp 2>/dev/null || true
fuser -k 3002/tcp 2>/dev/null || true

# 等待端口釋放
sleep 3

# 嘗試啟動開發服務器
echo "啟動開發服務器..."
PORT=3000 npm run dev