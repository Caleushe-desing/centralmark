#!/bin/sh
# Entrypoint producción: asegura dirs, migra SQLite y arranca Next.js
set -eu

DATA_DIR="${DATA_DIR:-/app/data}"
UPLOADS_DIR="${UPLOADS_DIR:-/app/public/uploads}"
GENERATED_DIR="${GENERATED_DIR:-/app/public/generated}"
SEED_MARKER="${DATA_DIR}/.seeded"
export DATABASE_URL="${DATABASE_URL:-file:/app/data/dev.db}"

mkdir -p "$DATA_DIR" "$UPLOADS_DIR" "$GENERATED_DIR"

echo "[centralmark] DATABASE_URL=$DATABASE_URL"
echo "[centralmark] Aplicando migraciones Prisma…"
./node_modules/.bin/prisma migrate deploy

if [ ! -f "$SEED_MARKER" ]; then
  echo "[centralmark] Primera ejecución: sembrando datos demo…"
  if node --experimental-strip-types ./scripts/docker-seed.mjs; then
    touch "$SEED_MARKER"
    echo "[centralmark] Seed OK"
  else
    echo "[centralmark] WARN: seed falló (continuamos arranque)"
  fi
else
  echo "[centralmark] Seed ya aplicado (omitido)"
fi

echo "[centralmark] Iniciando Next.js en :${PORT:-3000}"
exec node server.js
