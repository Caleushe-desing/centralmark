---
name: desplegar-vps
description: >
  Despliega CentralMark al servidor VPS con Docker. Usar SOLO cuando el usuario
  diga explícitamente "/desplegar-vps", "desplegar vps", "subir al servidor",
  "deploy vps" o "publicar en el VPS". Nunca desplegar de forma automática al
  cerrar jornada ni al hacer commits/PRs.
---

# Desplegar VPS

Publica la rama de trabajo actual en el VPS de producción (`166.1.85.154`) usando Docker Compose.

## Detectar intención

| Lo que dice el usuario | Acción |
|------------------------|--------|
| `/desplegar-vps` · "desplegar vps" · "subir al servidor" · "deploy vps" · "publicar en el VPS" | Ejecutar deploy |
| Cerrar jornada / commit / PR / merge | **NO** desplegar |

## Flujo por defecto del proyecto (recordatorio)

1. Trabajar y commitear en la rama de feature (`cursor/…-7bcc`).
2. Push + PR hacia `master` cuando corresponda.
3. `/cerrar-jornada` (y `+ merge` solo si el usuario lo pide).
4. **Solo si el usuario lo pide:** `/desplegar-vps`.

## Pasos

1. Confirma que hay clave SSH en `~/.ssh/id_ed25519_centralmark` y que el remoto responde.
2. Asegura que los cambios relevantes estén **commiteados y pusheados** a la rama actual (si hay cambios sin commit, pregunta o haz commit descriptivo primero).
3. Ejecuta:

```bash
bash scripts/deploy-vps.sh
# equivalente: npm run deploy:vps
```

4. Verifica health:

```bash
curl -s -o /dev/null -w "%{http_code}" http://166.1.85.154/
```

5. Resume en español:
   - Rama desplegada / commit
   - URL pública (`http://166.1.85.154`)
   - Estado del contenedor / HTTP
   - Credenciales demo si aplica

## Reglas importantes

- **Nunca** ejecutes este skill salvo comando explícito de despliegue.
- **Nunca** hagas force push.
- No imprimas secretos (`.env`, `OPENAI_API_KEY`, `SESSION_SECRET`).
- Si el deploy falla (build Docker, permisos SQLite, cookies), investiga logs con SSH y corrige antes de dar por bueno.
- Variables VPS actuales relevantes: `APP_PUBLIC_URL=http://166.1.85.154`, `COOKIE_SECURE=false` (hasta tener HTTPS).
