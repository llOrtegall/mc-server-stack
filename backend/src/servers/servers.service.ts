import { randomBytes } from 'crypto'
import { pool } from '../db/index.js'
import { AppError } from '../middleware/error.middleware.js'
import * as dockerService from '../docker/docker.service.js'
import { resetCounter } from '../watchdog/watchdog.service.js'

export interface Server {
  id: string
  name: string
  version: string
  port: number
  rcon_port: number
  container_id: string | null
  status: string
  ram_mb: number
  cpu_limit: number
  created_at: Date
  updated_at: Date
}

interface CreateServerInput {
  name: string
  version?: string
  port: number
  ram_mb?: number
  cpu_limit?: number
}

export async function listServers(): Promise<Server[]> {
  const result = await pool.query<Server>(
    'SELECT id, name, version, port, rcon_port, container_id, status, ram_mb, cpu_limit, created_at, updated_at FROM servers ORDER BY created_at DESC',
  )
  return result.rows
}

export async function getServer(id: string): Promise<Server> {
  const result = await pool.query<Server>(
    'SELECT id, name, version, port, rcon_port, container_id, status, ram_mb, cpu_limit, created_at, updated_at FROM servers WHERE id = $1',
    [id],
  )
  const server = result.rows[0]
  if (!server) throw new AppError(404, 'Server not found')
  return server
}

export async function createServer(input: CreateServerInput): Promise<Server> {
  const version = input.version ?? '1.21.4'
  const ramMb = input.ram_mb ?? 1024
  const cpuLimit = input.cpu_limit ?? 1.0
  const rconPort = input.port + 1
  const rconPassword = randomBytes(16).toString('hex')

  const result = await pool.query<Server>(
    `INSERT INTO servers (name, version, port, rcon_port, rcon_password, ram_mb, cpu_limit)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, name, version, port, rcon_port, container_id, status, ram_mb, cpu_limit, created_at, updated_at`,
    [input.name, version, input.port, rconPort, rconPassword, ramMb, cpuLimit],
  )

  const server = result.rows[0]
  if (!server) throw new AppError(500, 'Failed to create server')

  const containerId = await dockerService.createContainer({
    id: server.id,
    name: server.name,
    version,
    port: input.port,
    rconPort,
    rconPassword,
    ramMb,
    cpuLimit,
  })

  await pool.query('UPDATE servers SET container_id = $1 WHERE id = $2', [
    containerId,
    server.id,
  ])

  return { ...server, container_id: containerId }
}

export async function deleteServer(id: string): Promise<void> {
  const server = await getServer(id)
  if (server.container_id) {
    await dockerService.removeContainer(server.container_id)
  }
  resetCounter(id)
  await pool.query('DELETE FROM servers WHERE id = $1', [id])
}

export async function startServer(id: string): Promise<void> {
  const server = await getServer(id)
  if (!server.container_id) throw new AppError(400, 'Server has no container')

  await pool.query("UPDATE servers SET status = 'starting', updated_at = NOW() WHERE id = $1", [id])
  try {
    await dockerService.startContainer(server.container_id)
    await pool.query("UPDATE servers SET status = 'running', updated_at = NOW() WHERE id = $1", [id])
  } catch (err) {
    await pool.query("UPDATE servers SET status = 'error', updated_at = NOW() WHERE id = $1", [id])
    throw err
  }
}

export async function stopServer(id: string): Promise<void> {
  const server = await getServer(id)
  if (!server.container_id) throw new AppError(400, 'Server has no container')

  resetCounter(id)
  await pool.query("UPDATE servers SET status = 'stopping', updated_at = NOW() WHERE id = $1", [id])
  await dockerService.stopContainer(server.container_id)
  await pool.query("UPDATE servers SET status = 'stopped', updated_at = NOW() WHERE id = $1", [id])
}

export async function restartServer(id: string): Promise<void> {
  const server = await getServer(id)
  if (!server.container_id) throw new AppError(400, 'Server has no container')

  await pool.query("UPDATE servers SET status = 'starting', updated_at = NOW() WHERE id = $1", [id])
  await dockerService.restartContainer(server.container_id)
  await pool.query("UPDATE servers SET status = 'running', updated_at = NOW() WHERE id = $1", [id])
}
