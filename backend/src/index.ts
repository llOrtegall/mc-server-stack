import http from 'http'
import cors from 'cors'
import express from 'express'
import jwt from 'jsonwebtoken'
import { WebSocketServer } from 'ws'
import { config } from './config.js'
import { migrate } from './db/index.js'
import { authRouter } from './auth/auth.router.js'
import { serversRouter } from './servers/servers.router.js'
import { consoleRouter } from './console/console.router.js'
import { backupsRouter } from './backups/backups.router.js'
import { authMiddleware } from './middleware/auth.middleware.js'
import { errorMiddleware } from './middleware/error.middleware.js'
import { createAdminIfNone } from './auth/auth.service.js'
import { registerClient, startLogStream } from './console/console.service.js'
import { startWatchdog } from './watchdog/watchdog.service.js'
import { pool } from './db/index.js'

const app = express()

app.use(cors())
app.use(express.json())

// Routes
app.use('/api/auth', authRouter)
app.use('/api/servers', authMiddleware, serversRouter)
app.use('/api/servers/:id/console', authMiddleware, consoleRouter)
app.use('/api/servers/:id/backups', authMiddleware, backupsRouter)

app.get('/health', (_req, res) => res.json({ status: 'ok' }))

app.use(errorMiddleware)

// HTTP + WebSocket server
const server = http.createServer(app)
const wss = new WebSocketServer({ noServer: true })

server.on('upgrade', async (request, socket, head) => {
  const parsed = new URL(request.url ?? '', 'http://localhost')
  const match = parsed.pathname.match(/^\/ws\/servers\/([^/]+)$/)

  if (!match?.[1]) {
    socket.destroy()
    return
  }

  const token = parsed.searchParams.get('token')

  if (!token) {
    socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n')
    socket.destroy()
    return
  }

  try {
    jwt.verify(token, config.jwtSecret)
  } catch {
    socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n')
    socket.destroy()
    return
  }

  const serverId = match[1]

  wss.handleUpgrade(request, socket, head, async (ws) => {
    registerClient(serverId, ws)

    const result = await pool.query<{ container_id: string; status: string }>(
      'SELECT container_id, status FROM servers WHERE id = $1',
      [serverId],
    )
    const srv = result.rows[0]
    if (srv?.container_id && srv.status === 'running') {
      startLogStream(serverId, srv.container_id).catch((err) =>
        console.error('[ws] log stream error', err),
      )
    }
  })
})

async function main() {
  await migrate()

  const adminEmail = process.env['ADMIN_EMAIL'] ?? 'admin@minecraft.local'
  const adminPassword = process.env['ADMIN_PASSWORD'] ?? 'changeme123'
  await createAdminIfNone(adminEmail, adminPassword)
  startWatchdog()

  server.listen(config.port, () => {
    console.log(`[server] listening on http://localhost:${config.port}`)
    console.log(`[server] WebSocket on ws://localhost:${config.port}/ws/servers/:id?token=JWT`)
  })
}

main().catch((err) => {
  console.error('[fatal]', err)
  process.exit(1)
})
