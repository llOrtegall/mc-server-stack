import type { CreateServerInput } from '../domain/CreateServerInput.js';
import type { ServerPropertiesInput } from '../domain/ServerProperties.js';
import { HttpServerRepository } from '../infrastructure/HttpServerRepository.js';
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

const serverRepository = new HttpServerRepository();

export const serverFactory = {
  listServers: () => listServers({ serverRepository }),
  getServer: (id: string) => getServer({ serverRepository, id }),
  createServer: (input: CreateServerInput) =>
    createServer({ serverRepository, input }),
  updateServerProperties: (id: string, properties: ServerPropertiesInput) =>
    updateServerProperties({ serverRepository, id, properties }),
  startServer: (id: string) => startServer({ serverRepository, id }),
  stopServer: (id: string) => stopServer({ serverRepository, id }),
  restartServer: (id: string) => restartServer({ serverRepository, id }),
  setShowCoordinates: (id: string, enabled: boolean) =>
    setShowCoordinates({ serverRepository, id, enabled }),
  setPvp: (id: string, enabled: boolean) =>
    setPvp({ serverRepository, id, enabled }),
  deleteServer: (id: string) => deleteServer({ serverRepository, id }),
};
