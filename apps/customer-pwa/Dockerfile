# E-Pager Customer PWA — Turborepo-aware Next.js standalone build
# Build from repo root: docker build -f apps/customer-pwa/Dockerfile .

FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate

# ---- dependencies ----
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/ui/package.json ./packages/ui/
COPY packages/api-client/package.json ./packages/api-client/
COPY packages/auth/package.json ./packages/auth/
COPY packages/i18n/package.json ./packages/i18n/
COPY apps/customer-pwa/package.json ./apps/customer-pwa/
RUN pnpm install --frozen-lockfile

# ---- builder ----
FROM deps AS builder
WORKDIR /app
COPY . .
ARG NEXT_PUBLIC_API_URL=https://api.orderpager.net
ARG NEXT_PUBLIC_TENANT_ID=""
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_TENANT_ID=$NEXT_PUBLIC_TENANT_ID
RUN pnpm --filter @epager/customer-pwa build

# ---- runner ----
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/apps/customer-pwa/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/customer-pwa/.next/static ./apps/customer-pwa/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/customer-pwa/public ./apps/customer-pwa/public

USER nextjs
EXPOSE 3000
ENV PORT=3000 HOSTNAME=0.0.0.0
CMD ["node", "apps/customer-pwa/server.js"]
