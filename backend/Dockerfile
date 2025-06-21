FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY core/package*.json ./core/
COPY backend/package*.json ./backend/

# Copy core package source (needed for @repo/core dependency)
COPY core/ /app/core/

# Install dependencies and build core package
WORKDIR /app/core
RUN npm ci && npm run build

# Copy backend source
COPY backend/ /app/backend/

# Install backend dependencies
WORKDIR /app/backend
RUN npm ci

# Generate Prisma client
RUN npx prisma generate

# Build the backend application
RUN npm run build

# Start the application with migrations
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
