# MC Server Stack — Backend

REST API para gestionar servidores de Minecraft usando Docker. Inspirado en Aternos.

**Stack:** Bun · TypeScript · Express v5 · PostgreSQL · Dockerode · WebSocket · S3/R2

---

## Requisitos

- [Bun](https://bun.sh) >= 1.3
- Docker (con socket en `/var/run/docker.sock`)
- PostgreSQL
- Bucket en Cloudflare R2 o AWS S3

---

## Instalación

```bash
bun install
cp .env.example .env
# edita .env con tus valores
bun run dev
```

Al arrancar por primera vez:
- Las migraciones de la base de datos se aplican automáticamente.
- Se crea un admin por defecto con `ADMIN_EMAIL` / `ADMIN_PASSWORD` si no existe ninguno.

---

## Variables de entorno

| Variable | Descripción | Ejemplo |
|---|---|---|
| `PORT` | Puerto del servidor HTTP | `3000` |
| `DATABASE_URL` | Cadena de conexión PostgreSQL | `postgres://user:pass@localhost:5432/mcstack` |
| `JWT_SECRET` | Secreto para firmar tokens JWT | `random_string_largo` |
| `JWT_EXPIRES_IN` | Expiración del token | `7d` |
| `DOCKER_SOCKET` | Ruta al socket de Docker | `/var/run/docker.sock` |
| `MC_DATA_PATH` | Directorio host donde se guardan los datos de cada servidor | `/data/mc-servers` |
| `R2_ENDPOINT` | Endpoint de Cloudflare R2 o S3 | `https://<id>.r2.cloudflarestorage.com` |
| `R2_ACCESS_KEY_ID` | Access Key de R2/S3 | |
| `R2_SECRET_ACCESS_KEY` | Secret Key de R2/S3 | |
| `R2_BUCKET` | Nombre del bucket de backups | `mc-backups` |
| `ADMIN_EMAIL` | Email del admin inicial | `admin@minecraft.local` |
| `ADMIN_PASSWORD` | Contraseña del admin inicial | `changeme123` |

---

## Endpoints

Todas las rutas protegidas requieren el header:
```
Authorization: Bearer <token>
```

---

### Auth `/api/auth`

#### `POST /api/auth/login`
Inicia sesión y retorna un JWT.

**Body:**
```json
{ "email": "admin@minecraft.local", "password": "changeme123" }
```

**Response:**
```json
{
  "token": "eyJ...",
  "admin": { "id": "uuid", "email": "admin@minecraft.local", "created_at": "..." }
}
```

---

#### `GET /api/auth/me` 🔒
Retorna la información del admin autenticado.

**Response:**
```json
{ "id": "uuid", "email": "admin@minecraft.local", "created_at": "..." }
```

---

### Servidores `/api/servers` 🔒

#### `GET /api/servers`
Lista todos los servidores.

**Response:** `Server[]`

---

#### `POST /api/servers`
Crea un nuevo servidor Minecraft y su contenedor Docker.

**Body:**
```json
{
  "name": "mi-servidor",
  "version": "1.21.4",
  "port": 25565,
  "ram_mb": 2048,
  "cpu_limit": 2.0
}
```

| Campo | Tipo | Requerido | Default |
|---|---|---|---|
| `name` | string | ✅ | — |
| `version` | string | ❌ | `1.21.4` |
| `port` | number (1024–65534) | ✅ | — |
| `ram_mb` | number (512–16384) | ❌ | `1024` |
| `cpu_limit` | number (0.1–8) | ❌ | `1.0` |

> El puerto RCON se asigna automáticamente como `port + 1`.

**Response:** `201 Server`

---

#### `GET /api/servers/:id`
Retorna el detalle de un servidor.

---

#### `DELETE /api/servers/:id`
Elimina el servidor y su contenedor Docker.

**Response:** `204 No Content`

---

#### `POST /api/servers/:id/start`
Arranca el servidor.

**Response:** `{ "message": "Server started" }`

---

#### `POST /api/servers/:id/stop`
Detiene el servidor (graceful, 10s timeout).

**Response:** `{ "message": "Server stopped" }`

---

#### `POST /api/servers/:id/restart`
Reinicia el servidor.

**Response:** `{ "message": "Server restarted" }`

---

### Consola `/api/servers/:id/console` 🔒

#### `GET /api/servers/:id/console/logs?tail=100`
Retorna las últimas N líneas de logs del servidor.

| Query param | Default |
|---|---|
| `tail` | `100` |

**Response:** `{ "logs": "..." }`

---

#### `POST /api/servers/:id/console/command`
Ejecuta un comando en el servidor vía RCON. El servidor debe estar en estado `running`.

**Body:**
```json
{ "command": "list" }
```

**Response:** `{ "response": "There are 2/20 players online: ..." }`

---

### WebSocket — Logs en tiempo real

```
ws://localhost:3000/ws/servers/:id?token=<JWT>
```

Abre una conexión WebSocket para recibir los logs del servidor en tiempo real. El token JWT se pasa como query parameter.

**Ejemplo (JavaScript):**
```js
const ws = new WebSocket(`ws://localhost:3000/ws/servers/${serverId}?token=${token}`)
ws.onmessage = (e) => console.log(e.data)
```

---

### Backups `/api/servers/:id/backups` 🔒

#### `GET /api/servers/:id/backups`
Lista todos los backups del servidor.

**Response:** `Backup[]`

---

#### `POST /api/servers/:id/backups`
Crea un backup: comprime el directorio de datos del servidor y lo sube a R2/S3.

**Response:** `201 Backup`

---

#### `DELETE /api/servers/:id/backups/:backupId`
Elimina un backup de R2/S3 y de la base de datos.

**Response:** `204 No Content`

---

#### `POST /api/servers/:id/backups/:backupId/restore`
Restaura un backup: descarga el archivo de R2/S3 y reemplaza los datos del servidor.

> El servidor debe estar detenido antes de restaurar.

**Response:** `{ "message": "Backup restored successfully" }`

---

## Modelo de datos

### Server

```ts
{
  id: string          // UUID
  name: string
  version: string     // e.g. "1.21.4"
  port: number        // puerto Minecraft (externo)
  rcon_port: number   // port + 1
  container_id: string | null
  status: "stopped" | "starting" | "running" | "stopping" | "error"
  ram_mb: number
  cpu_limit: number
  created_at: string
  updated_at: string
}
```

### Backup

```ts
{
  id: string
  server_id: string
  s3_key: string
  size_bytes: number | null
  created_at: string
}
```

---

## Arquitectura

```
src/
├── auth/           # Login + JWT
├── servers/        # CRUD servidores + control Docker
├── console/        # Logs HTTP + RCON + WebSocket
├── backups/        # Backups en R2/S3
├── db/             # Pool pg + migraciones SQL
├── docker/         # Wrapper de dockerode
├── middleware/     # Auth JWT + error handler
├── config.ts       # Validación de variables de entorno
└── index.ts        # Express + HTTP server + WebSocket
```

Cada módulo sigue la estructura: `router → controller → service`.

Los servidores Minecraft corren en contenedores Docker usando la imagen [`itzg/minecraft-server`](https://github.com/itzg/docker-minecraft-server). Los datos de cada servidor se persisten en `MC_DATA_PATH/{id}/` en el host.

---

## Health check

```
GET /health
→ { "status": "ok" }
```
