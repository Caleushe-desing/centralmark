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

1. Si el usuario indica una rama concreta y no está en ella, haz `git checkout <rama>` primero.
2. Ejecuta:

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
- Si el usuario continúa trabajo de ayer, debe estar en la misma rama (o indicarla).
- No hagas merge ni push en este skill.
