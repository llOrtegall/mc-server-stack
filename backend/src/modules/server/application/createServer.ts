import { Server } from '../domain/Server.js';
import type { ServerPropertiesInput } from '../domain/ServerProperties.js';
import type { ServerRepository } from '../domain/ServerRepository.js';
import type { ServerRuntime } from '../domain/ServerRuntime.js';

interface CreateServerProps {
  serverRepository: ServerRepository;
  serverRuntime: ServerRuntime;
  name: string;
  version?: string | null;
  port: number;
  ramMb?: number | null;
  cpuLimit?: number | null;
  properties?: ServerPropertiesInput | null;
}

export async function createServer({
  serverRepository,
  serverRuntime,
  name,
  version,
  port,
  ramMb,
  cpuLimit,
  properties,
}: CreateServerProps): Promise<Server> {
  const server = Server.provisionNew({
    name,
    version,
    port,
    ramMb,
    cpuLimit,
    properties,
  });

  const created = await serverRepository.create(server);
  const id = created.getId();
  if (id === null) {
    throw new Error('[createServer] Persisted server is missing an id');
  }

  const containerId = await serverRuntime.provision(created);
  return serverRepository.update(created.withContainerId(containerId));
}
