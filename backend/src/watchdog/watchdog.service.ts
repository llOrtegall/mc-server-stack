import { RconConsoleGateway } from '../modules/console/infrastructure/RconConsoleGateway.js';
import { DockerServerRuntime } from '../modules/server/infrastructure/DockerServerRuntime.js';
import { PostgresServerRepository } from '../modules/server/infrastructure/PostgresServerRepository.js';
import { Watchdog } from './Watchdog.js';

const watchdog = new Watchdog({
  serverRepository: new PostgresServerRepository(),
  serverRuntime: new DockerServerRuntime(),
  consoleGateway: new RconConsoleGateway(),
});

export function startWatchdog(): void {
  watchdog.start();
}

export function resetCounter(serverId: string): void {
  watchdog.reset(serverId);
}
