import type { CreateServerInput } from './CreateServerInput.js';
import type { Server } from './Server.js';
import type { ServerList } from './ServerList.js';
import type { ServerPropertiesInput } from './ServerProperties.js';

export interface ServerRepository {
  getAll: () => Promise<ServerList>;
  getById: (id: string) => Promise<Server | null>;
  create: (input: CreateServerInput) => Promise<Server>;
  update: (id: string, properties: ServerPropertiesInput) => Promise<Server>;
  start: (id: string) => Promise<void>;
  stop: (id: string) => Promise<void>;
  restart: (id: string) => Promise<void>;
  setShowCoordinates: (id: string, enabled: boolean) => Promise<Server>;
  setPvp: (id: string, enabled: boolean) => Promise<Server>;
  delete: (id: string) => Promise<boolean>;
}
