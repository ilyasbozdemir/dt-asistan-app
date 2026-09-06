FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# 1. Install dependencies
FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/app-landing/package.json ./apps/app-landing/
RUN pnpm --filter app-landing install --frozen-lockfile

# 2. Build the app
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/app-landing/node_modules ./apps/app-landing/node_modules
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/app-landing ./apps/app-landing
RUN pnpm --filter app-landing build

# 3. Production runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/app-landing/public ./apps/app-landing/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/app-landing/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/app-landing/.next/static ./apps/app-landing/.next/static

USER nextjs
EXPOSE 3001
CMD ["node", "apps/app-landing/server.js"]
