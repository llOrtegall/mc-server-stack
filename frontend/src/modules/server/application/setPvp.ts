import type { Server } from '../domain/Server.js';
import type { ServerRepository } from '../domain/ServerRepository.js';

interface SetPvpProps {
  serverRepository: ServerRepository;
  id: string;
  enabled: boolean;
}

export function setPvp({
  serverRepository,
  id,
  enabled,
}: SetPvpProps): Promise<Server> {
  return serverRepository.setPvp(id, enabled);
}
