
FROM node:24-bookworm-slim

# Cài OpenSSL để hỗ trợ Prisma 6
RUN apt-get update && \
    apt-get install -y --no-install-recommends openssl ca-certificates && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Cài thư viện
COPY package.json package-lock.json ./
RUN npm ci

# Sao chép Prisma schema và migrations
COPY prisma ./prisma
COPY prisma.config.ts ./

# Sinh Prisma Client cho môi trường Linux
# URL bên dưới chỉ dùng khi generate, không kết nối DB
RUN DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder?schema=public" npx prisma generate

# Sao chép mã nguồn Express
COPY src ./src

EXPOSE 3000

# Áp dụng migration rồi khởi động server
CMD ["sh", "-c", "npx prisma migrate deploy && node src/server.js"]
