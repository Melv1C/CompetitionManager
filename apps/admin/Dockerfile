FROM node:22-alpine AS base
RUN apk update && apk add --no-cache libc6-compat
WORKDIR /app

# ---
FROM base AS prepare
RUN npm install -g turbo@^2
COPY . .
# Prune the monorepo for the admin app
RUN turbo prune admin --docker

# ---
FROM base AS installer
# First install the dependencies (as they change less often)
COPY --from=prepare /app/out/json/ .
COPY --from=prepare /app/out/package-lock.json ./package-lock.json
RUN npm ci

# ---
FROM base AS builder
# Copy dependencies
COPY --from=installer /app/ .
# Copy source files
COPY --from=prepare /app/out/full/ .

# Uncomment and use build args to enable remote caching
# ARG TURBO_TEAM
# ENV TURBO_TEAM=$TURBO_TEAM
# ARG TURBO_TOKEN
# ENV TURBO_TOKEN=$TURBO_TOKEN

# Build the admin app
RUN npm run build -- --filter=admin

# ---
FROM nginx:alpine AS runner
# Copy built static files to nginx
COPY --from=builder /app/apps/admin/dist /usr/share/nginx/html

# Copy nginx configuration
COPY apps/admin/nginx.conf /etc/nginx/conf.d/default.conf

# Copy runtime env script and make it executable
# This script runs on container startup to replace MY_APP_* placeholders
COPY apps/admin/env.sh /docker-entrypoint.d/env.sh
RUN chmod +x /docker-entrypoint.d/env.sh

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
