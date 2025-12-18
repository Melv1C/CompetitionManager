# =============================================================================
# Stage 1: Build the application
# =============================================================================
FROM node:22-alpine AS build

WORKDIR /app

# Copy package files first for better caching
COPY core/package*.json ./core/
COPY ui/package*.json ./ui/
COPY frontend/package*.json ./frontend/

# Copy and build core package (needed for @repo/core dependency)
COPY core/ /app/core/
WORKDIR /app/core
RUN npm ci && npm run build

# Copy and build ui package (needed for @repo/ui dependency)
COPY ui/ /app/ui/
WORKDIR /app/ui
RUN npm ci && npm run build

# Copy frontend source and build
COPY frontend/ /app/frontend/
WORKDIR /app/frontend
RUN npm ci && npm run build

# =============================================================================
# Stage 2: Production image with Nginx
# =============================================================================
FROM nginx:alpine

# Copy built assets from build stage
COPY --from=build /app/frontend/dist /usr/share/nginx/html

# Copy nginx configuration
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Copy runtime env script and make it executable
# This script runs on container startup to replace MY_APP_* placeholders
COPY frontend/env.sh /docker-entrypoint.d/env.sh
RUN chmod +x /docker-entrypoint.d/env.sh

EXPOSE 80
