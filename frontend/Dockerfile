# Development/Runtime build for React/Vite frontend
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY core/package*.json ./core/
COPY frontend/package*.json ./frontend/

# Copy core package source (needed for @repo/core dependency)
COPY core/ /app/core/

# Install dependencies and build core package
WORKDIR /app/core
RUN npm ci && npm run build

# Copy frontend source
COPY frontend/ /app/frontend/

# Install frontend dependencies
WORKDIR /app/frontend
RUN npm ci

# Build the frontend application
CMD [ "npm", "run", "build" ]
