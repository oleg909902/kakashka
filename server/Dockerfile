# Build from the repo root: docker build -f server/Dockerfile .
FROM node:22-alpine
WORKDIR /app/server

COPY server/package.json server/package-lock.json ./
RUN npm ci

COPY shared /app/shared
COPY server/ ./

ENV NODE_ENV=production PORT=3000
EXPOSE 3000
CMD ["npx", "tsx", "src/index.ts"]
