import { PassThrough } from 'node:stream';
import type { WebSocket } from 'ws';
import * as dockerService from '../../../docker/docker.service.js';
import { PostgresConsoleServerRepository } from './PostgresConsoleServerRepository.js';

const consoleServerRepository = new PostgresConsoleServerRepository();

/**
 * Live console plumbing: holds the per-server set of WebSocket clients and pipes
 * the demuxed Docker log stream to them. This is real-time infrastructure, not a
 * use case, so it is driven directly by the WebSocket upgrade handler.
 */

// Map of serverId -> active websocket clients
const wsClients = new Map<string, Set<WebSocket>>();

export function registerClient(serverId: string, ws: WebSocket): void {
  if (!wsClients.has(serverId)) wsClients.set(serverId, new Set());
  wsClients.get(serverId)?.add(ws);

  ws.on('close', () => {
    wsClients.get(serverId)?.delete(ws);
  });
}

export async function startLogStream(
  serverId: string,
  containerId: string,
): Promise<void> {
  const logStream = await dockerService.getLogStream(containerId, 0);
  const stdout = new PassThrough();
  const stderr = new PassThrough();

  dockerService.demuxLogs(logStream, stdout, stderr);

  const broadcast = (chunk: Buffer) => {
    const text = chunk.toString('utf8');
    wsClients.get(serverId)?.forEach((ws) => {
      if (ws.readyState === ws.OPEN) ws.send(text);
    });
  };

  stdout.on('data', broadcast);
  stderr.on('data', broadcast);

  logStream.on('end', () => {
    stdout.destroy();
    stderr.destroy();
  });
}

/**
 * Starts the live log stream for a server only when it is running. Resolves the
 * server through the console read model so no raw SQL leaks out of the repo.
 */
export async function streamIfRunning(serverId: string): Promise<void> {
  const server = await consoleServerRepository.findById(serverId);
  if (server?.containerId && server.status === 'running') {
    await startLogStream(serverId, server.containerId);
  }
}
