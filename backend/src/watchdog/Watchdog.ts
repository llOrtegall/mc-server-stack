import type { ConsoleGateway } from '../modules/console/domain/ConsoleGateway.js';
import { Server } from '../modules/server/domain/Server.js';
import type { ServerRepository } from '../modules/server/domain/ServerRepository.js';
import type { ServerRuntime } from '../modules/server/domain/ServerRuntime.js';
import { ServerStatus } from '../modules/server/domain/ServerStatus.js';

const POLL_INTERVAL_MS = 60_000; // check every 1 minute
const INACTIVITY_LIMIT = 5; // stop after 5 consecutive empty checks

interface WatchdogProps {
  serverRepository: ServerRepository;
  serverRuntime: ServerRuntime;
  consoleGateway: ConsoleGateway;
}

/**
 * Auto-stops running servers after a streak of empty player checks. Polls each
 * running server over RCON and keeps the inactivity streak in an in-memory Map,
 * so counters reset on process restart. Use cases that take a server out of the
 * running state must call {@link reset} (via the server activity tracker port).
 */
export class Watchdog {
  // serverId -> consecutive minutes with 0 players
  private readonly inactivity = new Map<string, number>();
  private readonly serverRepository: ServerRepository;
  private readonly serverRuntime: ServerRuntime;
  private readonly consoleGateway: ConsoleGateway;

  constructor({
    serverRepository,
    serverRuntime,
    consoleGateway,
  }: WatchdogProps) {
    this.serverRepository = serverRepository;
    this.serverRuntime = serverRuntime;
    this.consoleGateway = consoleGateway;
  }

  reset(serverId: string): void {
    this.inactivity.delete(serverId);
  }

  start(): void {
    console.log(
      `[watchdog] started — checking every ${POLL_INTERVAL_MS / 1000}s, stop after ${INACTIVITY_LIMIT} min idle`,
    );
    setInterval(() => {
      this.tick().catch((err) => console.error('[watchdog] tick error', err));
    }, POLL_INTERVAL_MS);
  }

  async tick(): Promise<void> {
    const servers = (await this.serverRepository.getAll())
      .toPrimitive()
      .filter((s) => s.status === 'running' && s.id !== null);

    for (const server of servers) {
      const id = server.id as string;
      const players = await this.countPlayers(
        server.rconPort,
        server.rconPassword,
      );

      if (players === null) continue; // RCON not reachable, skip
      if (players > 0) {
        this.inactivity.delete(id);
        continue;
      }

      const count = (this.inactivity.get(id) ?? 0) + 1;
      this.inactivity.set(id, count);
      console.log(
        `[watchdog] ${id} — 0 players (${count}/${INACTIVITY_LIMIT} min)`,
      );

      if (count >= INACTIVITY_LIMIT) await this.autoStop(server, id);
    }
  }

  private async autoStop(
    server: ReturnType<Server['toPrimitive']>,
    id: string,
  ): Promise<void> {
    console.log(`[watchdog] auto-stopping ${id} due to inactivity`);
    this.inactivity.delete(id);
    if (!server.containerId) return;
    try {
      await this.serverRuntime.stop(server.containerId);
      await this.serverRepository.update(
        Server.fromPrimitive(server).withStatus(ServerStatus.stopped()),
      );
      console.log(`[watchdog] ${id} stopped`);
    } catch (err) {
      console.error(`[watchdog] failed to stop ${id}`, err);
    }
  }

  private async countPlayers(
    rconPort: number,
    rconPassword: string,
  ): Promise<number | null> {
    try {
      const response = await this.consoleGateway.sendCommand(
        { rconPort, rconPassword },
        'list',
      );
      // "There are 2 of a max of 20 players online: ..."
      const match = response.match(/There are (\d+)/);
      if (!match?.[1]) return null;
      return parseInt(match[1], 10);
    } catch {
      // server still starting up or RCON not ready
      return null;
    }
  }
}
