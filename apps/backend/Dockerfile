FROM node:22-alpine AS base
RUN apk update && apk add --no-cache libc6-compat
WORKDIR /app

# ---
FROM base AS prepare
RUN npm install -g turbo@^2
COPY . .
# Prune the monorepo for the backend app
RUN turbo prune api --docker

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

RUN npm run build -- --filter=api

# ---
FROM base AS runner
# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs
USER nodejs

WORKDIR /app

# Copy built application
COPY --from=builder --chown=nodejs:nodejs /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder --chown=nodejs:nodejs /app/apps/backend/package.json ./apps/backend/package.json
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/packages ./packages

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["npm", "start", "--prefix", "apps/backend"]
