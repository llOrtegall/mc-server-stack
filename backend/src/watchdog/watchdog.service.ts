import { Rcon } from 'rcon-client'
import { pool } from '../db/index.js'
import { stopContainer } from '../docker/docker.service.js'

const POLL_INTERVAL_MS = 60_000   // check every 1 minute
const INACTIVITY_LIMIT = 5        // stop after 5 consecutive empty checks

// serverId -> consecutive minutes with 0 players
const inactivityCounter = new Map<string, number>()

export function resetCounter(serverId: string): void {
  inactivityCounter.delete(serverId)
}

async function getPlayerCount(
  rconPort: number,
  rconPassword: string,
): Promise<number | null> {
  const rcon = new Rcon({ host: '127.0.0.1', port: rconPort, password: rconPassword })
  try {
    await rcon.connect()
    const response = await rcon.send('list')
    await rcon.end()

    // "There are 2 of a max of 20 players online: ..."
    const match = response.match(/There are (\d+)/)
    if (!match?.[1]) return null
    return parseInt(match[1], 10)
  } catch {
    // server still starting up or RCON not ready
    return null
  }
}

async function tick(): Promise<void> {
  const result = await pool.query<{
    id: string
    container_id: string
    rcon_port: number
    rcon_password: string
  }>(
    "SELECT id, container_id, rcon_port, rcon_password FROM servers WHERE status = 'running'",
  )

  for (const server of result.rows) {
    const players = await getPlayerCount(server.rcon_port, server.rcon_password)

    if (players === null) continue  // RCON not reachable, skip

    if (players > 0) {
      inactivityCounter.delete(server.id)
      continue
    }

    const count = (inactivityCounter.get(server.id) ?? 0) + 1
    inactivityCounter.set(server.id, count)

    console.log(`[watchdog] ${server.id} — 0 players (${count}/${INACTIVITY_LIMIT} min)`)

    if (count >= INACTIVITY_LIMIT) {
      console.log(`[watchdog] auto-stopping ${server.id} due to inactivity`)
      inactivityCounter.delete(server.id)
      try {
        await stopContainer(server.container_id)
        await pool.query(
          "UPDATE servers SET status = 'stopped', updated_at = NOW() WHERE id = $1",
          [server.id],
        )
        console.log(`[watchdog] ${server.id} stopped`)
      } catch (err) {
        console.error(`[watchdog] failed to stop ${server.id}`, err)
      }
    }
  }
}

export function startWatchdog(): void {
  console.log(`[watchdog] started — checking every ${POLL_INTERVAL_MS / 1000}s, stop after ${INACTIVITY_LIMIT} min idle`)
  setInterval(() => {
    tick().catch((err) => console.error('[watchdog] tick error', err))
  }, POLL_INTERVAL_MS)
}
