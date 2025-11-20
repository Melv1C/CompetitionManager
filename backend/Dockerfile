FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY core/package*.json ./core/
COPY ui/package*.json ./ui/
COPY backend/package*.json ./backend/

# Copy core package source (needed for @repo/core dependency)
COPY core/ /app/core/

# Install dependencies and build core package
WORKDIR /app/core
RUN npm i && npm run build

# Copy ui package source (needed for @repo/ui dependency)
COPY ui/ /app/ui/

# Install dependencies and build ui package
WORKDIR /app/ui
RUN npm i && npm run build

# Copy backend source
COPY backend/ /app/backend/

# Install backend dependencies
WORKDIR /app/backend
RUN npm i

# Generate Prisma client
ENV DATABASE_URL="postgresql://user:password@localhost:5432/mydb"
RUN npx prisma generate

# Build the backend application
RUN npm run build

# Start the application with migrations
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
