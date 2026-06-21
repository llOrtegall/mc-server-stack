import type { Server } from '../domain/Server.js';
import type { ServerRepository } from '../domain/ServerRepository.js';
import type { ServerRuntime } from '../domain/ServerRuntime.js';
import { getServer } from './getServer.js';

interface SetPvpProps {
  serverRepository: ServerRepository;
  serverRuntime: ServerRuntime;
  id: string;
  enabled: boolean;
}

/**
 * Toggles the Bedrock `pvp` gamerule. Like `showcoordinates`, on Bedrock this is a
 * gamerule (not a server.property), delivered to the running container's console
 * via send-command, so the server must be running. The desired value is persisted
 * for the UI; the world keeps the setting across restarts.
 */
export async function setPvp({
  serverRepository,
  serverRuntime,
  id,
  enabled,
}: SetPvpProps): Promise<Server> {
  const server = await getServer({ serverRepository, id });

  if (!server.getEdition().isBedrock()) {
    throw new Error(
      '[setPvp] Toggling pvp at runtime is only supported on Bedrock servers',
    );
  }

  const containerId = server.getContainerId();
  if (containerId === null) {
    throw new Error('[setPvp] Server has no container');
  }
  if (server.toPrimitive().status !== 'running') {
    throw new Error('[setPvp] Server is not running');
  }

  await serverRuntime.setGameRule(containerId, 'pvp', enabled);
  return serverRepository.update(server.withPvp(enabled));
}
