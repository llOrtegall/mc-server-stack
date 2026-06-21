import type { ServerPropertiesInput } from '../domain/ServerProperties.js';
import { DockerServerRuntime } from '../infrastructure/DockerServerRuntime.js';
import { PostgresServerRepository } from '../infrastructure/PostgresServerRepository.js';
import { WatchdogServerActivityTracker } from '../infrastructure/WatchdogServerActivityTracker.js';
import { createServer } from './createServer.js';
import { deleteServer } from './deleteServer.js';
import { getServer } from './getServer.js';
import { listServers } from './listServers.js';
import { restartServer } from './restartServer.js';
import { setPvp } from './setPvp.js';
import { setShowCoordinates } from './setShowCoordinates.js';
import { startServer } from './startServer.js';
import { stopServer } from './stopServer.js';
import { updateServerProperties } from './updateServerProperties.js';

const serverRepository = new PostgresServerRepository();
const serverRuntime = new DockerServerRuntime();
const activityTracker = new WatchdogServerActivityTracker();

interface CreateServerInput {
  name: string;
  edition?: string | null;
  version?: string | null;
  port: number;
  ramMb?: number | null;
  cpuLimit?: number | null;
  properties?: ServerPropertiesInput | null;
}

export const serverFactory = {
  createServer: (input: CreateServerInput) =>
    createServer({ serverRepository, serverRuntime, ...input }),

  getServer: (id: string) => getServer({ serverRepository, id }),

  listServers: () => listServers({ serverRepository }),

  deleteServer: (id: string) =>
    deleteServer({ serverRepository, serverRuntime, activityTracker, id }),

  startServer: (id: string) =>
    startServer({ serverRepository, serverRuntime, id }),

  stopServer: (id: string) =>
    stopServer({ serverRepository, serverRuntime, activityTracker, id }),

  restartServer: (id: string) =>
    restartServer({ serverRepository, serverRuntime, id }),

  setShowCoordinates: (id: string, enabled: boolean) =>
    setShowCoordinates({ serverRepository, serverRuntime, id, enabled }),

  setPvp: (id: string, enabled: boolean) =>
    setPvp({ serverRepository, serverRuntime, id, enabled }),

  updateServerProperties: (
    id: string,
    properties?: ServerPropertiesInput | null,
  ) =>
    updateServerProperties({
      serverRepository,
      serverRuntime,
      activityTracker,
      id,
      properties,
    }),
};
