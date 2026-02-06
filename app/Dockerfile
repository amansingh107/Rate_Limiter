FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install express ioredis
COPY . .
CMD ["node", "fixed-window.js"]
