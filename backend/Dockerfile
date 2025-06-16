# ---- Builder ----
FROM node:18 AS builder

WORKDIR /usr/src/app

# Copy backend and core packages
COPY backend ./backend
COPY core ./core

# Install dependencies and build core
WORKDIR /usr/src/app/core
RUN npm install && npm run build

# Install dependencies and build backend
WORKDIR /usr/src/app/backend
RUN npm install && npm run build && npx prisma generate

# ---- Runtime ----
FROM node:18-slim
ENV NODE_ENV=production
WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/backend/dist ./dist
COPY --from=builder /usr/src/app/backend/node_modules ./node_modules
COPY --from=builder /usr/src/app/backend/prisma ./prisma
COPY backend/package.json ./package.json

EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
