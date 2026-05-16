import type { ConsoleRepository } from '../domain/ConsoleRepository.js';

interface SendCommandProps {
  consoleRepository: ConsoleRepository;
  serverId: string;
  command: string;
}

export function sendCommand({
  consoleRepository,
  serverId,
  command,
}: SendCommandProps): Promise<string> {
  if (!command) throw new Error('[sendCommand] Command must be provided');
  return consoleRepository.sendCommand(serverId, command);
}
