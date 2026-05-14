import type { ServerRepository } from '../domain/ServerRepository.js';

interface RestartServerProps {
  serverRepository: ServerRepository;
  id: string;
}

export function restartServer({
  serverRepository,
  id,
}: RestartServerProps): Promise<void> {
  return serverRepository.restart(id);
}
