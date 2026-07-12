# MarkMall — Marketing con IA para Malls

Plataforma MVP que permite a tiendas de un mall crear ofertas, generar automáticamente arte visual y copy con IA, y publicar en Instagram, Facebook y vitrina digital.

## Flujo

1. **Tienda** crea una oferta (producto, descuento, fechas, foto opcional)
2. **MarkAI** genera fondo con DALL-E, compone la imagen final, escribe captions y hashtags
3. **Admin del mall** aprueba la oferta
4. **Publicación** en Instagram, Facebook y vitrina digital

## Inicio rápido

```bash
npm install
npm run db:setup
cp .env.example .env
# Edita .env con tus API keys
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

## Flujo entre computadoras (notebook / PC)

Comandos en el chat del agente de Cursor (mismo usuario en ambos equipos):

| Comando | Cuándo usarlo |
|---------|---------------|
| `/iniciar-jornada` | Al **empezar** a trabajar (sincroniza con GitHub) |
| `/cerrar-jornada` | Al **terminar** — sube la rama, **sin** tocar master |
| `/cerrar-jornada` + merge | Al terminar y los cambios **están listos** — sube y mergea a master |

También puedes decir en lenguaje natural: *"iniciar jornada"*, *"cerrar jornada"*, *"cerrar jornada y mergear"*.

Equivalente manual:

```bash
npm run work:start
npm run work:end -- -m "tu mensaje"
npm run work:end -- -m "tu mensaje" --merge
```

### Rutas

| Ruta | Descripción |
|------|-------------|
| `/` | Landing |
| `/tienda` | Panel de tienda — crear ofertas |
| `/admin` | Panel admin — aprobar y publicar |
| `/vitrina` | Vitrina digital fullscreen |

## Configuración de APIs

### OpenAI (requerido para IA completa)

1. Crea una API key en [platform.openai.com](https://platform.openai.com)
2. Agrégala como `OPENAI_API_KEY` en `.env`

Sin OpenAI, el sistema usa contenido y fondos de respaldo (menos impresionante en demo).

#### Cloud Agents de Cursor (no reconfigurar en cada sesión)

El archivo `.env` **no se sube a Git** (por seguridad). Cada sesión nueva del agente en la nube empieza sin tus keys.

**Configúralo una sola vez:**

1. Abre [cursor.com/dashboard/cloud-agents](https://cursor.com/dashboard/cloud-agents)
2. Pestaña **Secrets** → agrega `OPENAI_API_KEY` como **Runtime Secret**
3. Reinicia el Cloud Agent (o ejecuta `/iniciar-jornada`)

El script `npm run env:sync` (también en `npm run dev` y `/iniciar-jornada`) copia los Secrets del dashboard a `.env` local de la sesión.

En tu **PC local** (fuera de Cloud Agents), basta con tener `OPENAI_API_KEY` en `.env` — ahí sí persiste en disco.

### Meta — Instagram + Facebook (para publicación real)

1. Crea una app en [developers.facebook.com](https://developers.facebook.com)
2. Agrega el producto **Instagram Graph API** y **Facebook Login**
3. Vincula tu cuenta Instagram Business a una página de Facebook
4. Genera un **Page Access Token** con permisos:
   - `instagram_basic`
   - `instagram_content_publish`
   - `pages_manage_posts`
   - `pages_read_engagement`
5. Configura en `.env`:
   - `META_ACCESS_TOKEN`
   - `META_PAGE_ID` — ID de tu página de Facebook
   - `META_INSTAGRAM_ACCOUNT_ID` — ID de la cuenta IG Business

### URL pública (requerida para Instagram)

Instagram necesita una URL pública para descargar la imagen generada.

**En local con ngrok:**
```bash
ngrok http 3000
```
Copia la URL `https://xxxx.ngrok.io` en `APP_PUBLIC_URL`.

Facebook puede publicar subiendo el archivo directamente (no requiere URL pública).

## Demo en vivo (2 minutos)

1. Ve a `/tienda`
2. Crea oferta: "Zapatillas Nike Air Max, 30%, hoy y mañana"
3. Espera ~20s mientras la IA genera arte y copy
4. Ve a `/admin` → Aprueba la oferta
5. Click "Publicar en redes"
6. Abre `/vitrina` para ver la pantalla del mall

## Stack

- **Next.js 16** — App Router
- **Prisma 7** + SQLite — base de datos local
- **OpenAI GPT-4o-mini** — copy y hashtags
- **DALL-E 3** — fondos visuales generativos
- **Sharp** — composición de imagen final
- **Meta Graph API** — publicación IG/FB

## Scripts

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run db:setup     # Migrar + seed
npm run db:seed      # Solo seed
```
