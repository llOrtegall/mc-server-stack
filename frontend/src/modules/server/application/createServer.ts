import type { CreateServerInput } from '../domain/CreateServerInput.js';
import type { Server } from '../domain/Server.js';
import type { ServerRepository } from '../domain/ServerRepository.js';

interface CreateServerProps {
  serverRepository: ServerRepository;
  input: CreateServerInput;
}

export async function createServer({
  serverRepository,
  input,
}: CreateServerProps): Promise<Server> {
  if (!input.name) throw new Error('[createServer] Name must be provided');
  return serverRepository.create(input);
}
