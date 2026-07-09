#!/usr/bin/env bash
# Guarda y sube cambios al cerrar jornada. Opcionalmente mergea a master.
set -euo pipefail

MERGE=false
COMMIT_MSG=""
SKIP_COMMIT=false

usage() {
  echo "Uso: work-end.sh [-m \"mensaje\"] [--merge] [--skip-commit]"
  echo "  --merge        Mergea la rama actual a master y hace push"
  echo "  --skip-commit  Solo push (sin commit; útil si ya commiteaste)"
  exit 1
}

while [[ $# -gt 0 ]]; do
  case $1 in
    --merge) MERGE=true; shift ;;
    --skip-commit) SKIP_COMMIT=true; shift ;;
    -m) COMMIT_MSG="${2:-}"; shift 2 ;;
    -h|--help) usage ;;
    *) echo "Opción desconocida: $1"; usage ;;
  esac
done

ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"

BRANCH="$(git branch --show-current)"
if [ -z "$BRANCH" ]; then
  echo "❌ No hay rama activa."
  exit 1
fi

if [ "$BRANCH" = "master" ] && [ "$MERGE" = true ]; then
  echo "❌ Ya estás en master. --merge solo aplica desde una rama de trabajo."
  exit 1
fi

echo "═══════════════════════════════════════"
echo "  CERRAR JORNADA"
echo "═══════════════════════════════════════"
echo ""
echo "→ Rama: $BRANCH"
echo ""

# Commit si hay cambios
if [ "$SKIP_COMMIT" = false ]; then
  if ! git diff --quiet || ! git diff --cached --quiet || [ -n "$(git ls-files --others --exclude-standard)" ]; then
    if [ -z "$COMMIT_MSG" ]; then
      COMMIT_MSG="chore: cambios del $(date +%Y-%m-%d)"
    fi
    echo "→ Creando commit..."
    git add -A
    # No commitear .env ni bases de datos locales
    git reset HEAD .env dev.db prisma/dev.db 2>/dev/null || true
    if ! git diff --cached --quiet; then
      git commit -m "$COMMIT_MSG"
    else
      echo "→ Nada que commitear (solo archivos ignorados/local)."
    fi
  else
    echo "→ Sin cambios pendientes de commit."
  fi
fi

# Push rama actual
echo "→ Subiendo rama a origin..."
if git rev-parse --abbrev-ref --symbolic-full-name "@{u}" >/dev/null 2>&1; then
  git push origin "$BRANCH"
else
  git push -u origin "$BRANCH"
fi

echo ""
echo "✅ Rama $BRANCH subida a GitHub."

# Merge opcional a master
if [ "$MERGE" = true ]; then
  echo ""
  echo "── Merge a master ──"
  WORK_BRANCH="$BRANCH"

  git checkout master
  git pull origin master

  if git merge "$WORK_BRANCH" -m "Merge branch '$WORK_BRANCH'"; then
    git push origin master
    echo "✅ Mergeado a master y subido."
  else
    echo "❌ Conflicto al mergear. Resuélvelo manualmente y luego:"
    echo "   git add . && git commit && git push origin master"
    git checkout "$WORK_BRANCH"
    exit 1
  fi

  git checkout "$WORK_BRANCH"
  echo "→ Volviste a la rama $WORK_BRANCH"
fi

echo ""
echo "── Estado final ──"
git status -sb
