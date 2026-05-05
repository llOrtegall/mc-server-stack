import type { ServerRepository } from '../domain/ServerRepository.js';
import type { ServerRuntime } from '../domain/ServerRuntime.js';
import { ServerStatus } from '../domain/ServerStatus.js';
import { getServer } from './getServer.js';

interface StartServerProps {
  serverRepository: ServerRepository;
  serverRuntime: ServerRuntime;
  id: string;
}

export async function startServer({
  serverRepository,
  serverRuntime,
  id,
}: StartServerProps): Promise<void> {
  const server = await getServer({ serverRepository, id });

  const containerId = server.getContainerId();
  if (!containerId) throw new Error('[startServer] Server has no container');

  await serverRepository.update(
    server.withStatus(ServerStatus.create('starting')),
  );
  try {
    await serverRuntime.start(containerId);
    await serverRepository.update(
      server.withStatus(ServerStatus.create('running')),
    );
  } catch (err) {
    await serverRepository.update(
      server.withStatus(ServerStatus.create('error')),
    );
    throw err;
  }
}
