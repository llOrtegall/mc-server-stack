import type { ConsoleServer } from './ConsoleServer.js';

/** Reads the console-relevant view of a server. Implemented in infrastructure. */
export interface ConsoleServerRepository {
  findById: (serverId: string) => Promise<ConsoleServer | null>;
}
