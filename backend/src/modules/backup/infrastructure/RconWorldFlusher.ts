import type {
  ConsoleGateway,
  RconTarget,
} from '../../console/domain/ConsoleGateway.js';
import type { ServerRepository } from '../../server/domain/ServerRepository.js';
import type { WorldFlusher } from '../domain/WorldFlusher.js';

/** Flushes a running world to disk via RCON before archiving it. */
export class RconWorldFlusher implements WorldFlusher {
  private readonly serverRepository: ServerRepository;
  private readonly consoleGateway: ConsoleGateway;

  constructor(
    serverRepository: ServerRepository,
    consoleGateway: ConsoleGateway,
  ) {
    this.serverRepository = serverRepository;
    this.consoleGateway = consoleGateway;
  }

  /** Returns the RCON target only when the server is running, else null. */
  private async runningTarget(serverId: string): Promise<RconTarget | null> {
    const server = await this.serverRepository.getById(serverId);
    if (server === null) return null;
    const data = server.toPrimitive();
    if (data.status !== 'running') return null;
    return { rconPort: data.rconPort, rconPassword: data.rconPassword };
  }

  async flush(serverId: string): Promise<void> {
    const target = await this.runningTarget(serverId);
    if (target === null) return;
    await this.consoleGateway.sendCommand(target, 'save-off');
    await this.consoleGateway.sendCommand(target, 'save-all flush');
  }

  async resume(serverId: string): Promise<void> {
    const target = await this.runningTarget(serverId);
    if (target === null) return;
    await this.consoleGateway.sendCommand(target, 'save-on');
  }
}
