import type { Server } from '../domain/Server.js';
import type { ServerActivityTracker } from '../domain/ServerActivityTracker.js';
import {
  ServerProperties,
  type ServerPropertiesInput,
} from '../domain/ServerProperties.js';
import type { ServerRepository } from '../domain/ServerRepository.js';
import type { ServerRuntime } from '../domain/ServerRuntime.js';
import { ServerStatus } from '../domain/ServerStatus.js';
import { getServer } from './getServer.js';

interface UpdateServerPropertiesProps {
  serverRepository: ServerRepository;
  serverRuntime: ServerRuntime;
  activityTracker: ServerActivityTracker;
  id: string;
  properties?: ServerPropertiesInput | null;
}

export async function updateServerProperties({
  serverRepository,
  serverRuntime,
  activityTracker,
  id,
  properties,
}: UpdateServerPropertiesProps): Promise<Server> {
  const server = await getServer({ serverRepository, id });
  const updated = server.withProperties(ServerProperties.create(properties));

  // The container env (server.properties) is baked in at create time, so the
  // container must be recreated for the new properties to take effect. The data
  // dir (MC_DATA_PATH/{id}) is preserved across the recreate via the bind mount.
  const containerId = server.getContainerId();
  if (containerId) {
    activityTracker.reset(id);
    await serverRuntime.remove(containerId);
  }

  const newContainerId = await serverRuntime.provision(updated);
  return serverRepository.update(
    updated.withContainerId(newContainerId).withStatus(ServerStatus.stopped()),
  );
}
