/**
 * Read model exposing only the fields the console context needs from a server:
 * how to reach its container logs and its RCON endpoint. Owned by this context,
 * decoupled from the server aggregate.
 */
export interface ConsoleServer {
  containerId: string | null;
  rconPort: number;
  rconPassword: string;
  status: string;
}
