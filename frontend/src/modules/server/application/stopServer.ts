import type { ServerRepository } from '../domain/ServerRepository.js';

interface StopServerProps {
  serverRepository: ServerRepository;
  id: string;
}

export function stopServer({
  serverRepository,
  id,
}: StopServerProps): Promise<void> {
  return serverRepository.stop(id);
}
