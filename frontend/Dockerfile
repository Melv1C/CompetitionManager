# ---- Builder ----
FROM node:18 AS builder

WORKDIR /usr/src/app

# Copy frontend and core packages
COPY frontend ./frontend
COPY core ./core

# Install dependencies and build core
WORKDIR /usr/src/app/core
RUN npm install && npm run build

# Install dependencies and build frontend
WORKDIR /usr/src/app/frontend
RUN npm install && npm run build

# ---- Static image ----
FROM alpine AS static
WORKDIR /app/dist
COPY --from=builder /usr/src/app/frontend/dist .

CMD ["sh", "-c", "echo 'Static build image. Mount /app/dist in nginx.'"]
