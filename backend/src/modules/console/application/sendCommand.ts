import type { ConsoleGateway } from '../domain/ConsoleGateway.js';
import type { ConsoleServerRepository } from '../domain/ConsoleServerRepository.js';

interface SendCommandProps {
  consoleServerRepository: ConsoleServerRepository;
  consoleGateway: ConsoleGateway;
  serverId: string;
  command: string;
}

export async function sendCommand({
  consoleServerRepository,
  consoleGateway,
  serverId,
  command,
}: SendCommandProps): Promise<string> {
  if (!command) throw new Error('[sendCommand] Command must be provided');

  const server = await consoleServerRepository.findById(serverId);
  if (server === null) throw new Error('[sendCommand] Server not found');
  if (server.status !== 'running')
    throw new Error('[sendCommand] Server is not running');

  return consoleGateway.sendCommand(
    { rconPort: server.rconPort, rconPassword: server.rconPassword },
    command,
  );
}
