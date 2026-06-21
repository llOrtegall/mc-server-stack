import { Server } from '../domain/Server.js';
import type { ServerPropertiesInput } from '../domain/ServerProperties.js';
import type { ServerRepository } from '../domain/ServerRepository.js';
import type { ServerRuntime } from '../domain/ServerRuntime.js';
import { provisionServerContainer } from './provisionServerContainer.js';

interface CreateServerProps {
  serverRepository: ServerRepository;
  serverRuntime: ServerRuntime;
  name: string;
  edition?: string | null;
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
  edition,
  version,
  port,
  ramMb,
  cpuLimit,
  properties,
}: CreateServerProps): Promise<Server> {
  const server = Server.provisionNew({
    name,
    edition,
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

  // Provisioning the container pulls the image (can take minutes), so we don't
  // block the request on it: return the server in `provisioning` immediately and
  // let the runtime work happen in the background, flipping the status when done.
  void provisionServerContainer({
    serverRepository,
    serverRuntime,
    server: created,
  });

  return created;
}
