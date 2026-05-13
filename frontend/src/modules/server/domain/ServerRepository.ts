import type { CreateServerInput } from './CreateServerInput.js';
import type { Server } from './Server.js';
import type { ServerList } from './ServerList.js';

export interface ServerRepository {
  getAll: () => Promise<ServerList>;
  getById: (id: string) => Promise<Server | null>;
  create: (input: CreateServerInput) => Promise<Server>;
  start: (id: string) => Promise<void>;
  stop: (id: string) => Promise<void>;
  restart: (id: string) => Promise<void>;
  delete: (id: string) => Promise<boolean>;
}
