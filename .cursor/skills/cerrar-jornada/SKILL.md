---
name: cerrar-jornada
description: >
  Guarda y sube cambios al terminar de trabajar. Usar cuando el usuario diga
  "cerrar jornada", "/cerrar-jornada", "terminar jornada" o "subir cambios".
  Si además dice "+ merge", "y merge", "mergear a master" o "subir al master",
  incluye el flag --merge.
---

# Cerrar jornada

Guarda el trabajo en GitHub. Opcionalmente mergea a `master`.

## Detectar intención del usuario

| Lo que dice el usuario | Acción |
|------------------------|--------|
| `/cerrar-jornada` o "cerrar jornada" | Push de la rama **sin** merge a master |
| `/cerrar-jornada + merge` o "cerrar jornada y mergear" | Push + merge a `master` |

## Pasos

1. Pregunta o infiere un **mensaje de commit** claro según los cambios realizados.
   Si el usuario no especifica, redacta uno breve y descriptivo (no uses solo "WIP").
2. **Sin merge** (cambios aún no listos para master):

```bash
bash scripts/work-end.sh -m "mensaje descriptivo del commit"
```

3. **Con merge** (cambios probados y listos para master):

```bash
bash scripts/work-end.sh -m "mensaje descriptivo del commit" --merge
```

4. Resume en español:
   - Rama subida
   - Hash del commit (si hubo)
   - Si se mergeó a master o solo quedó en la rama
   - Enlace al repo/PR si aplica

## Reglas importantes

- **Nunca** uses `--merge` si el usuario no lo pidió explícitamente.
- **Nunca** hagas force push.
- Si hay conflictos al mergear, detente y explica cómo resolverlos.
- No commitees `.env`, `dev.db` ni `prisma/dev.db` (el script ya los excluye).
