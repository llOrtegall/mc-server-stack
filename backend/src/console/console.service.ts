import { PassThrough } from 'stream'
import { Rcon } from 'rcon-client'
import type { WebSocket } from 'ws'
import { pool } from '../db/index.js'
import { AppError } from '../middleware/error.middleware.js'
import * as dockerService from '../docker/docker.service.js'

// Map of serverId -> active websocket clients
const wsClients = new Map<string, Set<WebSocket>>()

export function registerClient(serverId: string, ws: WebSocket): void {
  if (!wsClients.has(serverId)) wsClients.set(serverId, new Set())
  wsClients.get(serverId)!.add(ws)

  ws.on('close', () => {
    wsClients.get(serverId)?.delete(ws)
  })
}

export async function startLogStream(serverId: string, containerId: string): Promise<void> {
  const logStream = await dockerService.getLogStream(containerId, 0)
  const stdout = new PassThrough()
  const stderr = new PassThrough()

  dockerService.demuxLogs(logStream, stdout, stderr)

  const broadcast = (chunk: Buffer) => {
    const text = chunk.toString('utf8')
    wsClients.get(serverId)?.forEach((ws) => {
      if (ws.readyState === ws.OPEN) ws.send(text)
    })
  }

  stdout.on('data', broadcast)
  stderr.on('data', broadcast)

  logStream.on('end', () => {
    stdout.destroy()
    stderr.destroy()
  })
}

export async function getLogs(containerId: string, tail = 100): Promise<string> {
  const logStream = await dockerService.getLogStream(containerId, tail)
  return new Promise((resolve, reject) => {
    const stdout = new PassThrough()
    const stderr = new PassThrough()
    const chunks: string[] = []

    dockerService.demuxLogs(logStream, stdout, stderr)

    stdout.on('data', (d: Buffer) => chunks.push(d.toString()))
    stderr.on('data', (d: Buffer) => chunks.push(d.toString()))
    stdout.on('end', () => resolve(chunks.join('')))
    stderr.on('error', reject)

    setTimeout(() => {
      ;(logStream as NodeJS.ReadableStream & { destroy?: () => void }).destroy?.()
      resolve(chunks.join(''))
    }, 2000)
  })
}

export async function executeCommand(
  serverId: string,
  command: string,
): Promise<string> {
  const result = await pool.query<{
    container_id: string
    rcon_port: number
    rcon_password: string
    status: string
  }>(
    'SELECT container_id, rcon_port, rcon_password, status FROM servers WHERE id = $1',
    [serverId],
  )

  const server = result.rows[0]
  if (!server) throw new AppError(404, 'Server not found')
  if (server.status !== 'running') throw new AppError(400, 'Server is not running')

  const rcon = new Rcon({
    host: '127.0.0.1',
    port: server.rcon_port,
    password: server.rcon_password,
  })

  await rcon.connect()
  const response = await rcon.send(command)
  await rcon.end()

  return response
}
