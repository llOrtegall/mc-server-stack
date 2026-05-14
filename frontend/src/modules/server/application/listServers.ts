import type { ServerList } from '../domain/ServerList.js';
import type { ServerRepository } from '../domain/ServerRepository.js';

interface ListServersProps {
  serverRepository: ServerRepository;
}

export function listServers({
  serverRepository,
}: ListServersProps): Promise<ServerList> {
  return serverRepository.getAll();
}
