# 🚀 部署指南 - 祝福牆

本指南將協助您在外網安全地部署祝福牆應用程式。

## 📋 部署前準備

### 1. 系統需求
- Linux 伺服器（推薦 Ubuntu 20.04+）
- Docker 和 Docker Compose
- 至少 2GB RAM
- 20GB 可用硬碟空間
- 開放的端口：80, 443（HTTPS）

### 2. 網域設定
- 購買或準備一個網域名稱
- 將網域 A 記錄指向您的伺服器 IP

## 🔒 安全設定

### 1. 密碼保護設定

系統預設啟用密碼保護，訪客需要輸入密碼才能進入網站。

```bash
# 設定環境變數
cp .env.production.example .env.production

# 編輯 .env.production
nano .env.production
```

**重要設定：**
```env
# 設定網站密碼（請更改為強密碼）
WEDDING_WALL_PASSWORD=your-secure-password-here

# 設定 MinIO 密碼（請更改）
MINIO_ROOT_USER=admin
MINIO_ROOT_PASSWORD=your-secure-minio-password-here

# 設定 Session 密鑰（請生成隨機字串）
SESSION_SECRET=your-random-session-secret-here
```

### 2. 生成安全密碼

```bash
# 生成隨機密碼
openssl rand -base64 32

# 或使用 pwgen
pwgen -s 32 1
```

## 🌐 部署步驟

### 1. 基本部署（HTTP）

```bash
# 克隆專案
git clone https://github.com/yourusername/wedding-wall.git
cd wedding-wall

# 設定環境變數
cp .env.production.example .env.production
# 編輯 .env.production 設定密碼

# 啟動服務
docker-compose -f docker-compose.production.yml up -d

# 查看狀態
docker-compose -f docker-compose.production.yml ps
```

### 2. HTTPS 部署（推薦）

#### 選項 A：使用 Let's Encrypt（免費 SSL）

```bash
# 安裝 Certbot
sudo apt update
sudo apt install certbot

# 獲取 SSL 證書
sudo certbot certonly --standalone -d your-domain.com

# 修改 nginx.conf，取消註釋 SSL 設定
nano nginx.conf

# 重啟服務
docker-compose -f docker-compose.production.yml restart nginx
```

#### 選項 B：使用自己的 SSL 證書

```bash
# 創建 SSL 目錄
mkdir -p ssl

# 複製您的證書
cp /path/to/your/cert.pem ssl/
cp /path/to/your/key.pem ssl/

# 更新 nginx.conf 中的證書路徑
```

### 3. 自動更新 SSL 證書

```bash
# 創建更新腳本
cat > renew-ssl.sh << 'EOF'
#!/bin/bash
certbot renew --quiet
docker-compose -f docker-compose.production.yml restart nginx
EOF

chmod +x renew-ssl.sh

# 添加到 crontab
crontab -e
# 添加以下行（每週一凌晨 3 點檢查更新）
0 3 * * 1 /path/to/wedding-wall/renew-ssl.sh
```

## 🛡️ 安全最佳實踐

### 1. 防火牆設定

```bash
# 使用 UFW（Ubuntu 防火牆）
sudo ufw allow 22/tcp  # SSH
sudo ufw allow 80/tcp  # HTTP
sudo ufw allow 443/tcp # HTTPS
sudo ufw enable
```

### 2. 定期備份

```bash
# 創建備份腳本
cat > backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/backup/wedding-wall"
DATE=$(date +%Y%m%d_%H%M%S)

# 創建備份目錄
mkdir -p $BACKUP_DIR

# 備份 MinIO 數據
docker run --rm -v wedding-wall_minio_data:/data -v $BACKUP_DIR:/backup alpine tar czf /backup/minio-$DATE.tar.gz -C /data .

# 保留最近 7 天的備份
find $BACKUP_DIR -name "minio-*.tar.gz" -mtime +7 -delete
EOF

chmod +x backup.sh

# 添加到 crontab（每天凌晨 2 點備份）
0 2 * * * /path/to/wedding-wall/backup.sh
```

### 3. 監控和日誌

```bash
# 查看應用日誌
docker-compose -f docker-compose.production.yml logs -f wedding-wall

# 查看 Nginx 日誌
docker-compose -f docker-compose.production.yml logs -f nginx

# 監控資源使用
docker stats
```

## 📱 使用流程

### 1. 訪客訪問流程
1. 訪問網站 URL
2. 輸入密碼（您設定的 WEDDING_WALL_PASSWORD）
3. 進入主頁面
4. 上傳照片和祝福
5. 查看祝福牆

### 2. 密碼分享建議
- 製作精美的邀請卡，包含網址和密碼
- 使用 QR Code 包含網址（密碼另外告知）
- 在活動現場展示密碼
- 透過私訊發送給特定賓客

### 3. Session 管理
- 登入後預設 3 小時有效
- 3 小時後需要重新輸入密碼
- 關閉瀏覽器不會登出（使用 sessionStorage）

## 🔧 故障排除

### 問題：無法訪問網站

```bash
# 檢查容器狀態
docker-compose -f docker-compose.production.yml ps

# 檢查端口
netstat -tlnp | grep -E "80|443"

# 檢查防火牆
sudo ufw status
```

### 問題：密碼錯誤

```bash
# 檢查環境變數
docker-compose -f docker-compose.production.yml exec wedding-wall env | grep PASSWORD

# 重新設定密碼
# 編輯 .env.production
# 重啟服務
docker-compose -f docker-compose.production.yml restart
```

### 問題：上傳失敗

```bash
# 檢查 MinIO
docker-compose -f docker-compose.production.yml logs minio

# 檢查磁碟空間
df -h

# 檢查權限
docker-compose -f docker-compose.production.yml exec minio ls -la /data
```

## 🚨 緊急措施

### 臨時關閉網站

```bash
# 停止服務
docker-compose -f docker-compose.production.yml stop

# 或只停止 Web 服務
docker-compose -f docker-compose.production.yml stop wedding-wall nginx
```

### 重置所有數據

```bash
# 警告：這將刪除所有上傳的照片和訊息！
docker-compose -f docker-compose.production.yml down -v
docker-compose -f docker-compose.production.yml up -d
```

### 更改密碼

```bash
# 編輯環境變數
nano .env.production

# 重啟應用
docker-compose -f docker-compose.production.yml restart wedding-wall
```

## 📊 效能優化

### 1. 增加上傳限制

編輯 `nginx.conf`：
```nginx
client_max_body_size 50M;  # 增加到 50MB
```

### 2. 調整併發連接

編輯 `nginx.conf`：
```nginx
worker_connections 2048;  # 增加連接數
```

### 3. 優化圖片儲存

考慮使用圖片壓縮服務或 CDN 來加速圖片載入。

## 📅 3個月後的處理

### 1. 下載所有數據

```bash
# 創建備份
./backup.sh

# 下載到本地
scp user@server:/backup/wedding-wall/minio-*.tar.gz ./
```

### 2. 關閉服務

```bash
# 停止並移除所有容器
docker-compose -f docker-compose.production.yml down

# 保留數據卷（如需要）
# 或完全清理
docker-compose -f docker-compose.production.yml down -v
```

### 3. 轉換為私人相簿

如果想保留作為私人回憶，可以：
- 更改密碼為更私密的密碼
- 限制 IP 訪問
- 移至內網伺服器

## 💡 其他建議

1. **定期檢查**：每週至少檢查一次系統狀態
2. **更新密碼**：如果密碼外洩，立即更改
3. **監控流量**：注意異常流量，防止惡意攻擊
4. **備份重要時刻**：在活動當天結束後立即備份

---

祝您的活動順利，讓這個祝福牆成為美好的回憶！ 💝