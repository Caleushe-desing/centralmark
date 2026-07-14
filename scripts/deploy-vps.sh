#!/usr/bin/env bash
# Despliega CentralMark al VPS vía SSH + Docker Compose
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"

SSH_KEY="${SSH_KEY:-$HOME/.ssh/id_ed25519_centralmark}"
SSH_HOST="${SSH_HOST:-root@166.1.85.154}"
REMOTE_DIR="${REMOTE_DIR:-/opt/centralmark}"
SSH_OPTS=(-i "$SSH_KEY" -o StrictHostKeyChecking=accept-new -o IdentitiesOnly=yes)

echo "═══════════════════════════════════════"
echo "  DEPLOY CentralMark → $SSH_HOST"
echo "═══════════════════════════════════════"

if [ ! -f "$SSH_KEY" ]; then
  echo "❌ No existe la clave SSH: $SSH_KEY"
  exit 1
fi

echo "→ Probando SSH…"
ssh "${SSH_OPTS[@]}" "$SSH_HOST" "docker --version && docker compose version"

echo "→ Preparando directorio remoto $REMOTE_DIR…"
ssh "${SSH_OPTS[@]}" "$SSH_HOST" "mkdir -p '$REMOTE_DIR'"

echo "→ Sincronizando código (rsync)…"
rsync -az --delete \
  --exclude '.git' \
  --exclude 'node_modules' \
  --exclude '.next' \
  --exclude '.env' \
  --exclude 'prisma/dev.db' \
  --exclude 'prisma/dev.db-journal' \
  --exclude 'public/uploads/*' \
  --exclude 'public/generated/*' \
  --exclude '.cursor' \
  -e "ssh ${SSH_OPTS[*]}" \
  "$ROOT/" "$SSH_HOST:$REMOTE_DIR/"

# Restaurar .gitkeep en uploads/generated
ssh "${SSH_OPTS[@]}" "$SSH_HOST" "mkdir -p '$REMOTE_DIR/public/uploads' '$REMOTE_DIR/public/generated' && touch '$REMOTE_DIR/public/uploads/.gitkeep' '$REMOTE_DIR/public/generated/.gitkeep'"

echo "→ Escribiendo .env de producción en el VPS…"
# SESSION_SECRET: reutilizar si existe; si no, generar
EXISTING_SECRET="$(ssh "${SSH_OPTS[@]}" "$SSH_HOST" "grep -E '^SESSION_SECRET=' '$REMOTE_DIR/.env' 2>/dev/null | cut -d= -f2- || true")"
if [ -z "$EXISTING_SECRET" ]; then
  SESSION_SECRET="$(openssl rand -hex 32)"
else
  SESSION_SECRET="$EXISTING_SECRET"
fi

# Leer OPENAI_API_KEY del .env local (no se imprime)
OPENAI_API_KEY="$(grep -E '^OPENAI_API_KEY=' "$ROOT/.env" | head -1 | cut -d= -f2- | sed 's/^\"//;s/\"$//')"
if [ -z "$OPENAI_API_KEY" ]; then
  echo "❌ Falta OPENAI_API_KEY en .env local"
  exit 1
fi

APP_PUBLIC_URL="${APP_PUBLIC_URL:-http://166.1.85.154}"

ssh "${SSH_OPTS[@]}" "$SSH_HOST" "cat > '$REMOTE_DIR/.env' <<EOF
NODE_ENV=production
DATABASE_URL=file:/app/data/dev.db
OPENAI_API_KEY=${OPENAI_API_KEY}
SESSION_SECRET=${SESSION_SECRET}
APP_PUBLIC_URL=${APP_PUBLIC_URL}
EOF
chmod 600 '$REMOTE_DIR/.env'"

echo "→ Build & up (docker compose)…"
ssh "${SSH_OPTS[@]}" "$SSH_HOST" "cd '$REMOTE_DIR' && docker compose up --build -d"

echo "→ Esperando health…"
for i in $(seq 1 40); do
  code="$(ssh "${SSH_OPTS[@]}" "$SSH_HOST" "curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1/ || true")"
  echo "  intento $i → HTTP $code"
  if [ "$code" = "200" ]; then
    break
  fi
  sleep 3
done

echo ""
echo "── Estado contenedores ──"
ssh "${SSH_OPTS[@]}" "$SSH_HOST" "cd '$REMOTE_DIR' && docker compose ps && docker compose logs --tail=40 web"

echo ""
echo "✅ Deploy listo: $APP_PUBLIC_URL"
echo "   Tienda: sneakerzone / tienda123"
echo "   Admin:  admin2026"
