# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY tsconfig*.json nest-cli.json ./
COPY src ./src

RUN npm run build
RUN npm prune --production

# Stage 2: Production
FROM node:22-alpine AS production

WORKDIR /usr/src/app

ENV NODE_ENV=production

COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist

EXPOSE 4000

CMD ["node", "dist/main.js"]
