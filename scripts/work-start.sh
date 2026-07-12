#!/usr/bin/env bash
# Sincroniza el repo al empezar a trabajar (iniciar jornada).
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"

echo "═══════════════════════════════════════"
echo "  INICIAR JORNADA"
echo "═══════════════════════════════════════"
echo ""

git fetch origin

LAST_BRANCH_FILE=".cursor/last-branch"
TARGET_BRANCH=""
if [ -f "$LAST_BRANCH_FILE" ]; then
  TARGET_BRANCH="$(tr -d '[:space:]' < "$LAST_BRANCH_FILE")"
fi

BRANCH="$(git branch --show-current)"
if [ -z "$BRANCH" ]; then
  echo "❌ No hay rama activa. Haz checkout a la rama en la que quieres trabajar."
  exit 1
fi

STASHED=false
if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "→ Guardando cambios locales temporalmente (stash)..."
  git stash push -u -m "iniciar-jornada auto-stash $(date +%s)"
  STASHED=true
fi

# Cambiar a la última rama de trabajo guardada al cerrar jornada
if [ -n "$TARGET_BRANCH" ] && [ "$BRANCH" != "$TARGET_BRANCH" ]; then
  if git show-ref --verify --quiet "refs/heads/$TARGET_BRANCH" || \
     git ls-remote --heads origin "$TARGET_BRANCH" | grep -q "$TARGET_BRANCH"; then
    echo "→ Última rama trabajada: $TARGET_BRANCH (estabas en $BRANCH)"
    git checkout "$TARGET_BRANCH" 2>/dev/null || git checkout -b "$TARGET_BRANCH" "origin/$TARGET_BRANCH"
    BRANCH="$TARGET_BRANCH"
  else
    echo "⚠ Rama guardada '$TARGET_BRANCH' no existe. Continuando en $BRANCH."
  fi
fi

echo "→ Rama activa: $BRANCH"
echo ""

pull_branch() {
  local target="$1"
  echo "→ Actualizando desde origin/$target..."
  git pull --rebase origin "$target"
}

# Sincronizar rama con remoto (si existe upstream)
if git rev-parse --abbrev-ref --symbolic-full-name "@{u}" >/dev/null 2>&1; then
  pull_branch "$BRANCH" || echo "⚠ No se pudo actualizar $BRANCH (revisa conflictos)."
elif git ls-remote --heads origin "$BRANCH" | grep -q "$BRANCH"; then
  git branch --set-upstream-to="origin/$BRANCH" "$BRANCH" 2>/dev/null || true
  pull_branch "$BRANCH" || echo "⚠ No se pudo actualizar $BRANCH."
else
  echo "→ Rama nueva en local. Actualizando master de referencia..."
  git fetch origin master:refs/remotes/origin/master 2>/dev/null || true
fi

if [ "$STASHED" = true ]; then
  echo "→ Recuperando cambios locales..."
  git stash pop || echo "⚠ Conflicto al recuperar stash. Resuélvelo con: git stash list && git stash pop"
fi

echo ""

# Dependencias si hace falta
if [ ! -d node_modules ] || [ package-lock.json -nt node_modules/.package-lock.json ] 2>/dev/null; then
  echo "→ Instalando dependencias (npm install)..."
  npm install
else
  echo "→ Dependencias al día."
fi

# Prisma client
if [ -f prisma/schema.prisma ]; then
  echo "→ Generando cliente Prisma..."
  npx prisma generate
fi

echo ""
echo "── Estado del repositorio ──"
git status -sb
echo ""
echo "── Últimos commits ──"
git log --oneline -5
echo ""
echo "✅ Listo para trabajar en: $BRANCH"
