/** RCON endpoint of a running server. */
export interface RconTarget {
  rconPort: number;
  rconPassword: string;
}

/**
 * Abstracts sending a command to a server over RCON and reading its reply.
 * Implemented in infrastructure (rcon-client); use cases depend only on this.
 */
export interface ConsoleGateway {
  sendCommand: (target: RconTarget, command: string) => Promise<string>;
}
