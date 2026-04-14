# E-Pager Staff App — Turborepo-aware Next.js standalone build
# Build from repo root: docker build -f apps/staff-app/Dockerfile .

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
COPY apps/staff-app/package.json ./apps/staff-app/
RUN pnpm install --frozen-lockfile

# ---- builder ----
FROM deps AS builder
WORKDIR /app
COPY . .
RUN pnpm --filter @epager/staff-app build

# ---- runner ----
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

# Copy standalone output
COPY --from=builder --chown=nextjs:nodejs /app/apps/staff-app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/staff-app/.next/static ./apps/staff-app/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/staff-app/public ./apps/staff-app/public

USER nextjs
EXPOSE 3000
ENV PORT=3000 HOSTNAME=0.0.0.0
CMD ["node", "apps/staff-app/server.js"]
