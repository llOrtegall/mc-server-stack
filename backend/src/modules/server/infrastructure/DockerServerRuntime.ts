import * as dockerService from '../../../docker/docker.service.js';
import type { Server } from '../domain/Server.js';
import type { ServerRuntime } from '../domain/ServerRuntime.js';

export class DockerServerRuntime implements ServerRuntime {
  async provision(server: Server): Promise<string> {
    const data = server.toPrimitive();
    if (data.id === null) {
      throw new Error(
        '[DockerServerRuntime] Cannot provision a server without an id',
      );
    }
    return dockerService.createContainer({
      id: data.id,
      name: data.name,
      edition: data.edition,
      version: data.version,
      port: data.port,
      rconPort: data.rconPort,
      rconPassword: data.rconPassword,
      ramMb: data.ramMb,
      cpuLimit: data.cpuLimit,
      properties: data.properties,
    });
  }

  async start(containerId: string): Promise<void> {
    await dockerService.startContainer(containerId);
  }

  async stop(containerId: string): Promise<void> {
    await dockerService.stopContainer(containerId);
  }

  async restart(containerId: string): Promise<void> {
    await dockerService.restartContainer(containerId);
  }

  async remove(containerId: string): Promise<void> {
    await dockerService.removeContainer(containerId);
  }
}
