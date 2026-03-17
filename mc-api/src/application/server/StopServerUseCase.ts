import type { IServerRepository } from "../../domain/server/IServerRepository.js";
import type { DockerService } from "../../infrastructure/docker/DockerService.js";

export class StopServerUseCase {
  constructor(
    private readonly serverRepo: IServerRepository,
    private readonly dockerService: DockerService
  ) {}

  async execute(serverId: string): Promise<void> {
    const server = await this.serverRepo.findById(serverId);
    if (!server) throw new Error("Servidor no encontrado");

    if (server.status === "stopped") {
      throw new Error("El servidor ya está detenido");
    }

    server.updateStatus("stopping");
    await this.serverRepo.update(server);

    try {
      if (server.containerId) {
        await this.dockerService.stop(server.containerId);
      }
      server.updateStatus("stopped");
      await this.serverRepo.update(server);
    } catch (err) {
      server.updateStatus("error");
      await this.serverRepo.update(server);
      throw err;
    }
  }
}
