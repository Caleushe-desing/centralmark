#!/usr/bin/env bash
# Sincroniza variables del entorno (Secrets de Cursor Cloud) hacia .env local.
# .env no va a git — en Cloud Agents cada sesión empieza sin él.
# Configura OPENAI_API_KEY una vez en: cursor.com/dashboard/cloud-agents → Secrets
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT"

ENV_FILE=".env"
EXAMPLE_FILE=".env.example"

# Variables que pueden venir de Secrets del dashboard (runtime)
SYNC_VARS=(
  OPENAI_API_KEY
  OPENAI_CAMPAIGN_MODEL
  OPENAI_IMAGE_MODEL
  OPENAI_AD_IMAGE_MODEL
  SESSION_SECRET
  APP_PUBLIC_URL
  META_APP_ID
  META_APP_SECRET
  META_ACCESS_TOKEN
  META_PAGE_ID
  META_INSTAGRAM_ACCOUNT_ID
  REMOVEBG_API_KEY
)

touch "$ENV_FILE"

# DATABASE_URL por defecto si falta
if ! grep -q '^DATABASE_URL=' "$ENV_FILE" 2>/dev/null; then
  echo 'DATABASE_URL="file:./prisma/dev.db"' >> "$ENV_FILE"
fi

synced=0
for var in "${SYNC_VARS[@]}"; do
  value="${!var:-}"
  if [ -z "$value" ] || [ "$value" = "sk-..." ]; then
    continue
  fi

  escaped="${value//\\/\\\\}"
  escaped="${escaped//\"/\\\"}"

  if grep -q "^${var}=" "$ENV_FILE" 2>/dev/null; then
    # Actualizar solo si el valor en .env es placeholder o está vacío
    current="$(grep "^${var}=" "$ENV_FILE" | head -1 | cut -d= -f2- | tr -d '"' | tr -d "'")"
    if [ -z "$current" ] || [ "$current" = "sk-..." ]; then
      sed -i "/^${var}=/d" "$ENV_FILE"
      echo "${var}=\"${escaped}\"" >> "$ENV_FILE"
      synced=$((synced + 1))
    fi
  else
    echo "${var}=\"${escaped}\"" >> "$ENV_FILE"
    synced=$((synced + 1))
  fi
done

has_openai=false
if [ -n "${OPENAI_API_KEY:-}" ] && [ "${OPENAI_API_KEY}" != "sk-..." ]; then
  has_openai=true
elif grep -q '^OPENAI_API_KEY=.' "$ENV_FILE" 2>/dev/null; then
  key_line="$(grep '^OPENAI_API_KEY=' "$ENV_FILE" | head -1)"
  if ! echo "$key_line" | grep -q 'sk-\.\.\.' && ! echo "$key_line" | grep -qE '^OPENAI_API_KEY=$'; then
    has_openai=true
  fi
fi

echo "── Variables de entorno ──"
if [ "$has_openai" = true ]; then
  echo "✅ OpenAI: configurada"
else
  echo "⚠ OpenAI: NO configurada"
  echo "  → Una sola vez: cursor.com/dashboard/cloud-agents"
  echo "    → clic en tu entorno (ej. centralmark) → Secretos de ejecución"
  echo "    Agrega OPENAI_API_KEY y reinicia el agente."
  echo "  → O edita .env local (solo persiste en tu PC, no en Cloud Agents)."
fi

if [ "$synced" -gt 0 ]; then
  echo "→ $synced variable(s) sincronizada(s) desde Secrets hacia .env"
fi

if [ ! -f "$EXAMPLE_FILE" ]; then
  echo "→ Tip: copia .env.example como referencia de variables disponibles."
fi
