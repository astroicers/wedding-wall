FROM node:18-alpine

WORKDIR /app

# 複製 package.json 檔案
COPY package*.json ./

# 安裝依賴
RUN npm ci --only=production && npm cache clean --force

# 複製專案檔案
COPY . .

# 建置專案
RUN npm run build

# 暴露連接埠
EXPOSE 3000

# 啟動應用程式
CMD ["npm", "run", "preview"]