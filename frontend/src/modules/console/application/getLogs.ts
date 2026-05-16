import type { ConsoleRepository } from '../domain/ConsoleRepository.js';

interface GetLogsProps {
  consoleRepository: ConsoleRepository;
  serverId: string;
  tail: number;
}

export function getLogs({
  consoleRepository,
  serverId,
  tail,
}: GetLogsProps): Promise<string> {
  return consoleRepository.getLogs(serverId, tail);
}
