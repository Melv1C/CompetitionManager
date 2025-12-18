# =============================================================================
# Stage 1: Build the application
# =============================================================================
FROM node:22-alpine AS build

WORKDIR /app

# Copy package files first for better caching
COPY core/package*.json ./core/
COPY backend/package*.json ./backend/

# Copy and build core package (needed for @repo/core dependency)
COPY core/ /app/core/
WORKDIR /app/core
RUN npm ci && npm run build

# Copy backend source and install dependencies
COPY backend/ /app/backend/
WORKDIR /app/backend
RUN npm ci

# Generate Prisma client
ENV DATABASE_URL="postgresql://user:password@localhost:5432/mydb"
RUN npx prisma generate

# Build the backend application
RUN npm run build

# =============================================================================
# Stage 2: Production image
# =============================================================================
FROM node:22-alpine

WORKDIR /app

# Copy built core package
COPY --from=build /app/core /app/core

# Copy backend with node_modules and built files
COPY --from=build /app/backend /app/backend

WORKDIR /app/backend

# Expose the default port
EXPOSE 3000

# Start the application with migrations
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
