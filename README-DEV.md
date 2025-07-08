# 婚禮祝福牆 - 開發指南

## 🚀 快速開始（推薦）

### 開發模式 - 支援熱重載，無需重複 rebuild

```bash
# 啟動開發環境
./dev.sh start

# 查看日誌
./dev.sh logs

# 停止開發環境
./dev.sh stop
```

## 📋 所有命令

### 開發命令

```bash
./dev.sh start      # 啟動開發環境 (支援熱重載)
./dev.sh stop       # 停止開發環境  
./dev.sh restart    # 重啟開發環境
./dev.sh logs       # 查看應用日誌
./dev.sh build      # 重新建置映像 (更新依賴時使用)
./dev.sh clean      # 清理所有容器和映像
```

### 生產命令

```bash
./dev.sh prod       # 啟動生產環境 (需要重新建置)
```

### NPM 快捷命令

```bash
npm run docker:dev    # = ./dev.sh start
npm run docker:stop   # = ./dev.sh stop  
npm run docker:logs   # = ./dev.sh logs
npm run docker:prod   # = ./dev.sh prod
```

## 🔧 開發流程

### 1. 日常開發（推薦）

```bash
# 第一次啟動（會自動建置）
./dev.sh start

# 修改代碼... 
# 💡 文件變更會自動熱重載，無需重啟！

# 查看即時日誌
./dev.sh logs

# 停止開發環境
./dev.sh stop
```

### 2. 更新依賴時

```bash
# 重新建置映像
./dev.sh build

# 重啟開發環境
./dev.sh start
```

### 3. 部署生產環境

```bash
# 停止開發環境
./dev.sh stop

# 啟動生產環境
./dev.sh prod
```

## 📱 訪問地址

- **應用**: http://localhost:3000
- **MinIO 控制台**: http://localhost:9001 
  - 用戶名: `admin`
  - 密碼: `admin123`

## 💡 優勢

### ✅ 開發模式
- 🔥 **熱重載** - 代碼變更立即生效
- ⚡ **無需 rebuild** - 大幅節省開發時間  
- 🔍 **即時日誌** - 方便調試
- 📁 **文件同步** - 本地更改自動同步到容器

### ✅ 舊模式對比
- ❌ 每次 `docker-compose up --build` 需要 2-3 分鐘
- ✅ 現在只需要 `./dev.sh start` 幾秒鐘

## 🛠️ 故障排除

### 端口被佔用
```bash
# 停止所有相關容器
./dev.sh stop
docker-compose down

# 重新啟動
./dev.sh start
```

### 清理環境
```bash
# 完全清理
./dev.sh clean

# 重新開始
./dev.sh start
```

### 查看容器狀態
```bash
docker ps -a
docker-compose -f docker-compose.dev.yml logs
```

## 📂 文件結構

```
wedding-wall/
├── dev.sh                    # 開發工具腳本
├── docker-compose.dev.yml    # 開發環境配置
├── Dockerfile.dev            # 開發環境 Dockerfile  
├── docker-compose.yml        # 生產環境配置
└── Dockerfile                # 生產環境 Dockerfile
```

現在您可以享受快速的開發體驗！🎉