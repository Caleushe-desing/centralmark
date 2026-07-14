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

if [ ! -f "$SEED_MARKER" ]; then
  echo "[centralmark] Primera ejecución: sembrando datos demo…"
  # tsx puede estar como binario o solo como paquete; npx lo resuelve
  if ./node_modules/.bin/tsx prisma/seed.ts 2>/dev/null \
    || node ./node_modules/tsx/dist/cli.mjs prisma/seed.ts 2>/dev/null \
    || npx --yes tsx@4.23.0 prisma/seed.ts; then
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
