import type { ServerActivityTracker } from '../domain/ServerActivityTracker.js';
import type { ServerRepository } from '../domain/ServerRepository.js';
import type { ServerRuntime } from '../domain/ServerRuntime.js';
import { getServer } from './getServer.js';

interface DeleteServerProps {
  serverRepository: ServerRepository;
  serverRuntime: ServerRuntime;
  activityTracker: ServerActivityTracker;
  id: string;
}

export async function deleteServer({
  serverRepository,
  serverRuntime,
  activityTracker,
  id,
}: DeleteServerProps): Promise<void> {
  const server = await getServer({ serverRepository, id });

  const containerId = server.getContainerId();
  if (containerId) {
    await serverRuntime.remove(containerId);
  }
  activityTracker.reset(id);
  await serverRepository.delete(id);
}
