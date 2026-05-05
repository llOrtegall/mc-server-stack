import type { ServerRepository } from '../domain/ServerRepository.js';
import type { ServerRuntime } from '../domain/ServerRuntime.js';
import { ServerStatus } from '../domain/ServerStatus.js';
import { getServer } from './getServer.js';

interface RestartServerProps {
  serverRepository: ServerRepository;
  serverRuntime: ServerRuntime;
  id: string;
}

export async function restartServer({
  serverRepository,
  serverRuntime,
  id,
}: RestartServerProps): Promise<void> {
  const server = await getServer({ serverRepository, id });

  const containerId = server.getContainerId();
  if (!containerId) throw new Error('[restartServer] Server has no container');

  await serverRepository.update(
    server.withStatus(ServerStatus.create('starting')),
  );
  await serverRuntime.restart(containerId);
  await serverRepository.update(
    server.withStatus(ServerStatus.create('running')),
  );
}
