---
name: iniciar-jornada
description: >
  Sincroniza el repositorio al empezar a trabajar. Usar cuando el usuario diga
  "iniciar jornada", "/iniciar-jornada", "empezar a trabajar", "sincronizar repo"
  o quiera continuar en otro computador (notebook o PC).
---

# Iniciar jornada

Ejecuta el flujo de inicio de sesión de trabajo. **No modifiques código**; solo sincroniza.

## Pasos

1. Si el usuario indica una rama concreta distinta a la guardada, actualiza `.cursor/last-branch` con ese nombre antes de sincronizar.
2. Ejecuta (el script lee `.cursor/last-branch` y cambia automáticamente a la **última rama trabajada** al cerrar jornada):

```bash
bash scripts/work-start.sh
```

3. Resume el resultado en español:
   - Rama activa
   - Si hubo cambios al hacer pull
   - Si se instalaron dependencias
   - Últimos commits
4. Si hay conflictos de merge/rebase, detente y guía al usuario para resolverlos.

## Notas

- Funciona igual en notebook y PC de escritorio.
- La última rama se guarda en `.cursor/last-branch` al ejecutar `/cerrar-jornada`. No hace falta recordar el nombre: `/iniciar-jornada` siempre vuelve ahí.
- No hagas merge ni push en este skill.
- **API keys (OpenAI, Meta):** en Cloud Agents no persisten en `.env` entre sesiones. Configúralas **una vez** en [cursor.com/dashboard/cloud-agents](https://cursor.com/dashboard/cloud-agents) → **Secrets** (`OPENAI_API_KEY` como Runtime Secret). El script `sync-env.sh` las aplica al arrancar.
