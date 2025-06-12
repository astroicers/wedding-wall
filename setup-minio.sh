#!/bin/bash

echo "等待 MinIO 啟動..."
sleep 5

echo "使用 mc (MinIO Client) 建立 bucket..."

# 如果系統沒有 mc，使用 Docker 方式
docker run --rm --network host -it quay.io/minio/mc:latest sh -c "
  mc alias set local http://localhost:9000 admin admin123 &&
  mc mb local/wedding-wall --ignore-existing &&
  mc anonymous set public local/wedding-wall &&
  echo 'MinIO bucket wedding-wall 建立完成！'
"

echo "MinIO 設定完成！"
echo "MinIO Console: http://localhost:9001"
echo "帳號: admin"
echo "密碼: admin123"