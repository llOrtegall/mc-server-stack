import type { ServerRepository } from '../domain/ServerRepository.js';

interface DeleteServerProps {
  serverRepository: ServerRepository;
  id: string;
}

export function deleteServer({
  serverRepository,
  id,
}: DeleteServerProps): Promise<boolean> {
  return serverRepository.delete(id);
}
