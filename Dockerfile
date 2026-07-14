# syntax=docker/dockerfile:1.7
#
# CentralMark — imagen de producción Next.js (multi-stage)
# Next.js standalone + Prisma 7 + better-sqlite3 + sharp

ARG NODE_VERSION=20.19.4

# ─── Stage 1: dependencias (compila nativos) ─────────────────────────────────
FROM node:${NODE_VERSION}-bookworm-slim AS deps
WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    ca-certificates \
    openssl \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./

RUN npm ci

# ─── Stage 2: build ──────────────────────────────────────────────────────────
FROM node:${NODE_VERSION}-bookworm-slim AS builder
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV DATABASE_URL="file:./prisma/build-placeholder.db"

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npx prisma generate \
  && npm run build \
  && npm prune --omit=dev \
  && npm install prisma@7.8.0 dotenv@17.4.2 tsx@4.23.0 --omit=dev --no-save

# ─── Stage 3: runtime ────────────────────────────────────────────────────────
FROM node:${NODE_VERSION}-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV DATABASE_URL="file:/app/data/dev.db"

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    ca-certificates \
    openssl \
    tini \
    gosu \
  && rm -rf /var/lib/apt/lists/* \
  && groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs nextjs \
  && mkdir -p /app/data /app/public/uploads /app/public/generated \
  && chown -R nextjs:nodejs /app/data /app/public/uploads /app/public/generated

# App standalone
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Prisma + client generado + node_modules producción (incluye nativos)
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder --chown=nextjs:nodejs /app/src/generated ./src/generated
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

COPY --chown=nextjs:nodejs scripts/docker-entrypoint.sh /app/docker-entrypoint.sh
COPY --chown=nextjs:nodejs scripts/docker-seed.mjs /app/scripts/docker-seed.mjs
RUN chmod +x /app/docker-entrypoint.sh

# Entrypoint arranca como root para chown de volúmenes, luego baja a nextjs
USER root

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=50s --retries=5 \
  CMD node -e "fetch('http://127.0.0.1:3000/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

ENTRYPOINT ["/usr/bin/tini", "--", "/app/docker-entrypoint.sh"]
