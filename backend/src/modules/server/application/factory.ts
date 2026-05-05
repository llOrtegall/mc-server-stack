import { DockerServerRuntime } from '../infrastructure/DockerServerRuntime.js';
import { PostgresServerRepository } from '../infrastructure/PostgresServerRepository.js';
import { WatchdogServerActivityTracker } from '../infrastructure/WatchdogServerActivityTracker.js';
import { createServer } from './createServer.js';
import { deleteServer } from './deleteServer.js';
import { getServer } from './getServer.js';
import { listServers } from './listServers.js';
import { restartServer } from './restartServer.js';
import { startServer } from './startServer.js';
import { stopServer } from './stopServer.js';

const serverRepository = new PostgresServerRepository();
const serverRuntime = new DockerServerRuntime();
const activityTracker = new WatchdogServerActivityTracker();

interface CreateServerInput {
  name: string;
  version?: string | null;
  port: number;
  ramMb?: number | null;
  cpuLimit?: number | null;
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
};
