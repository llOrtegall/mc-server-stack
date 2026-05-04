import type { Server } from './Server.js';

/**
 * Abstracts the container engine that actually runs a Minecraft server.
 * Implemented in infrastructure (Docker); use cases depend only on this.
 */
export interface ServerRuntime {
  /** Provisions a container for the server and returns its container id. */
  provision: (server: Server) => Promise<string>;
  start: (containerId: string) => Promise<void>;
  stop: (containerId: string) => Promise<void>;
  restart: (containerId: string) => Promise<void>;
  remove: (containerId: string) => Promise<void>;
}
