import type { ServerRepository } from '../domain/ServerRepository.js';

interface StartServerProps {
  serverRepository: ServerRepository;
  id: string;
}

export function startServer({
  serverRepository,
  id,
}: StartServerProps): Promise<void> {
  return serverRepository.start(id);
}
