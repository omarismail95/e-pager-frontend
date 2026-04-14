# E-Pager Admin Portal — Turborepo-aware Next.js standalone build
# Build from repo root: docker build -f apps/admin-portal/Dockerfile .

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
COPY packages/types/package.json ./packages/types/
COPY apps/admin-portal/package.json ./apps/admin-portal/
RUN pnpm install --frozen-lockfile

# ---- builder ----
FROM deps AS builder
WORKDIR /app
COPY . .
RUN pnpm --filter @epager/admin-portal build

# ---- runner ----
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/apps/admin-portal/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/admin-portal/.next/static ./apps/admin-portal/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/admin-portal/public ./apps/admin-portal/public

USER nextjs
EXPOSE 3000
ENV PORT=3000 HOSTNAME=0.0.0.0
CMD ["node", "apps/admin-portal/server.js"]
