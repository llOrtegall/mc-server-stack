import type { ConsoleServerRepository } from '../domain/ConsoleServerRepository.js';
import type { LogReader } from '../domain/LogReader.js';

interface GetLogsProps {
  consoleServerRepository: ConsoleServerRepository;
  logReader: LogReader;
  serverId: string;
  tail: number;
}

export async function getLogs({
  consoleServerRepository,
  logReader,
  serverId,
  tail,
}: GetLogsProps): Promise<string> {
  const server = await consoleServerRepository.findById(serverId);
  if (server === null || server.containerId === null)
    throw new Error('[getLogs] Server not found or has no container');

  return logReader.getTail(server.containerId, tail);
}
