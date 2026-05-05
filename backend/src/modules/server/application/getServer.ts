import type { Server } from '../domain/Server.js';
import type { ServerRepository } from '../domain/ServerRepository.js';

interface GetServerProps {
  serverRepository: ServerRepository;
  id: string;
}

export async function getServer({
  serverRepository,
  id,
}: GetServerProps): Promise<Server> {
  if (!id) throw new Error('[getServer] Id must be provided');

  const server = await serverRepository.getById(id);
  if (server === null) {
    throw new Error(`[getServer] Server with id ${id} not found`);
  }
  return server;
}
