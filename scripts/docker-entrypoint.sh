#!/bin/sh
# Entrypoint producción: permisos de volúmenes, migrate, seed y Next.js
set -eu

DATA_DIR="${DATA_DIR:-/app/data}"
UPLOADS_DIR="${UPLOADS_DIR:-/app/public/uploads}"
GENERATED_DIR="${GENERATED_DIR:-/app/public/generated}"
SEED_MARKER="${DATA_DIR}/.seeded"
export DATABASE_URL="${DATABASE_URL:-file:/app/data/dev.db}"

# Root corrige ownership de volúmenes Docker y re-ejecuta como nextjs
if [ "$(id -u)" = "0" ]; then
  mkdir -p "$DATA_DIR" "$UPLOADS_DIR" "$GENERATED_DIR"
  chown -R nextjs:nodejs "$DATA_DIR" "$UPLOADS_DIR" "$GENERATED_DIR"
  exec gosu nextjs "$0" "$@"
fi

mkdir -p "$DATA_DIR" "$UPLOADS_DIR" "$GENERATED_DIR"

echo "[centralmark] uid=$(id -u) DATABASE_URL=$DATABASE_URL"
echo "[centralmark] Aplicando migraciones Prisma…"
./node_modules/.bin/prisma migrate deploy

echo "[centralmark] Sincronizando datos demo (upsert idempotente)…"
SEED_OK=0
if [ -f ./scripts/docker-seed.mjs ]; then
  if node ./scripts/docker-seed.mjs; then SEED_OK=1; fi
elif [ -x ./node_modules/.bin/tsx ]; then
  if ./node_modules/.bin/tsx prisma/seed.ts; then SEED_OK=1; fi
elif [ -f ./node_modules/tsx/dist/cli.mjs ]; then
  if node ./node_modules/tsx/dist/cli.mjs prisma/seed.ts; then SEED_OK=1; fi
fi
if [ "$SEED_OK" = "1" ]; then
  touch "$SEED_MARKER"
  echo "[centralmark] Seed OK"
else
  echo "[centralmark] WARN: seed falló (continuamos arranque)"
fi

echo "[centralmark] Iniciando Next.js en :${PORT:-3000}"
exec node server.js
