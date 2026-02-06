FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install express ioredis
COPY . .
# We use an ENV variable to decide which file to run
CMD ["sh", "-c", "node ${ALGO_FILE}"]