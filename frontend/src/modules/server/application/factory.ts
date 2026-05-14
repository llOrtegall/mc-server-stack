import type { CreateServerInput } from '../domain/CreateServerInput.js';
import { HttpServerRepository } from '../infrastructure/HttpServerRepository.js';
import { createServer } from './createServer.js';
import { deleteServer } from './deleteServer.js';
import { getServer } from './getServer.js';
import { listServers } from './listServers.js';
import { restartServer } from './restartServer.js';
import { startServer } from './startServer.js';
import { stopServer } from './stopServer.js';

const serverRepository = new HttpServerRepository();

export const serverFactory = {
  listServers: () => listServers({ serverRepository }),
  getServer: (id: string) => getServer({ serverRepository, id }),
  createServer: (input: CreateServerInput) =>
    createServer({ serverRepository, input }),
  startServer: (id: string) => startServer({ serverRepository, id }),
  stopServer: (id: string) => stopServer({ serverRepository, id }),
  restartServer: (id: string) => restartServer({ serverRepository, id }),
  deleteServer: (id: string) => deleteServer({ serverRepository, id }),
};
