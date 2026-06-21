import type { Server } from '../domain/Server.js';
import type { ServerRepository } from '../domain/ServerRepository.js';
import type { ServerRuntime } from '../domain/ServerRuntime.js';
import { ServerStatus } from '../domain/ServerStatus.js';

interface ProvisionServerContainerProps {
  serverRepository: ServerRepository;
  serverRuntime: ServerRuntime;
  server: Server;
}

/**
 * Creates the Docker container for an already-persisted server. This is the slow
 * part of provisioning (pulling the image can take minutes), so it runs detached
 * from the create request: the server sits in `provisioning` until this resolves,
 * then flips to `stopped` on success or `error` if the pull/create fails. It never
 * rejects — failures are recorded as the server's status.
 */
export async function provisionServerContainer({
  serverRepository,
  serverRuntime,
  server,
}: ProvisionServerContainerProps): Promise<void> {
  try {
    const containerId = await serverRuntime.provision(server);
    await serverRepository.update(
      server.withContainerId(containerId).withStatus(ServerStatus.stopped()),
    );
  } catch (err) {
    console.error(
      `[provisionServerContainer] Failed to provision server ${server.getId()}:`,
      err,
    );
    await serverRepository.update(server.withStatus(ServerStatus.error()));
  }
}
