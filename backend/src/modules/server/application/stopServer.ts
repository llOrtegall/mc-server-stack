import type { ServerActivityTracker } from '../domain/ServerActivityTracker.js';
import type { ServerRepository } from '../domain/ServerRepository.js';
import type { ServerRuntime } from '../domain/ServerRuntime.js';
import { ServerStatus } from '../domain/ServerStatus.js';
import { getServer } from './getServer.js';

interface StopServerProps {
  serverRepository: ServerRepository;
  serverRuntime: ServerRuntime;
  activityTracker: ServerActivityTracker;
  id: string;
}

export async function stopServer({
  serverRepository,
  serverRuntime,
  activityTracker,
  id,
}: StopServerProps): Promise<void> {
  const server = await getServer({ serverRepository, id });

  const containerId = server.getContainerId();
  if (!containerId) throw new Error('[stopServer] Server has no container');

  activityTracker.reset(id);
  await serverRepository.update(
    server.withStatus(ServerStatus.create('stopping')),
  );
  await serverRuntime.stop(containerId);
  await serverRepository.update(
    server.withStatus(ServerStatus.create('stopped')),
  );
}
