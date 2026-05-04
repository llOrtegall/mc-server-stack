import type { Server } from './Server.js';
import type { ServerList } from './ServerList.js';

export interface ServerRepository {
  create: (server: Server) => Promise<Server>;
  getById: (id: string) => Promise<Server | null>;
  getAll: () => Promise<ServerList>;
  update: (server: Server) => Promise<Server>;
  delete: (id: string) => Promise<boolean>;
}
