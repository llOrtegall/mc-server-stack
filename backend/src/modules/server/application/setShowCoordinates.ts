import type { Server } from '../domain/Server.js';
import type { ServerRepository } from '../domain/ServerRepository.js';
import type { ServerRuntime } from '../domain/ServerRuntime.js';
import { getServer } from './getServer.js';

interface SetShowCoordinatesProps {
  serverRepository: ServerRepository;
  serverRuntime: ServerRuntime;
  id: string;
  enabled: boolean;
}

/**
 * Toggles the Bedrock `showcoordinates` gamerule. It is delivered to the running
 * container via the in-container console (no RCON on Bedrock), and the gamerule is
 * only applied to a generated world, so the server must be running. The desired
 * value is persisted so the UI can reflect it; the world itself keeps the setting
 * across restarts.
 */
export async function setShowCoordinates({
  serverRepository,
  serverRuntime,
  id,
  enabled,
}: SetShowCoordinatesProps): Promise<Server> {
  const server = await getServer({ serverRepository, id });

  if (!server.getEdition().isBedrock()) {
    throw new Error(
      '[setShowCoordinates] Showing coordinates is only supported on Bedrock servers',
    );
  }

  const containerId = server.getContainerId();
  if (containerId === null) {
    throw new Error('[setShowCoordinates] Server has no container');
  }
  if (server.toPrimitive().status !== 'running') {
    throw new Error('[setShowCoordinates] Server is not running');
  }

  await serverRuntime.setGameRule(containerId, 'showcoordinates', enabled);
  return serverRepository.update(server.withShowCoordinates(enabled));
}
