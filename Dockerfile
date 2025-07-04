FROM node:18-alpine

WORKDIR /app

# 複製 package.json 檔案
COPY package*.json ./

# 安裝依賴，使用 legacy-peer-deps 解決 Pinia 插件版本衝突
RUN npm ci --legacy-peer-deps && npm cache clean --force

# 複製專案檔案
COPY . .

# 接收構建參數
ARG GOOGLE_CLIENT_ID
ARG GOOGLE_CLIENT_SECRET
ARG JWT_SECRET
ARG APP_URL

# 設定構建時環境變數
ENV GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID
ENV GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET
ENV JWT_SECRET=$JWT_SECRET
ENV APP_URL=$APP_URL

# 建置專案
RUN npm run build

# 暴露連接埠
EXPOSE 3000

# 啟動應用程式
CMD ["npm", "run", "preview"]