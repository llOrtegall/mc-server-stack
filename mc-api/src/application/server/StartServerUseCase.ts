import type { IServerRepository } from "../../domain/server/IServerRepository.js";
import type { DockerService } from "../../infrastructure/docker/DockerService.js";

export class StartServerUseCase {
  constructor(
    private readonly serverRepo: IServerRepository,
    private readonly dockerService: DockerService
  ) {}

  async execute(serverId: string): Promise<void> {
    const server = await this.serverRepo.findById(serverId);
    if (!server) throw new Error("Servidor no encontrado");

    if (server.status === "running" || server.status === "starting") {
      throw new Error(`El servidor ya está ${server.status}`);
    }

    server.updateStatus("starting");
    await this.serverRepo.update(server);

    try {
      if (server.containerId && await this.dockerService.exists(server.containerId)) {
        // El contenedor existe, solo iniciarlo
        await this.dockerService.start(server.containerId);
      } else {
        // Crear y arrancar un nuevo contenedor
        const containerId = await this.dockerService.createAndStart(server);
        server.assignContainer(containerId);
      }
      server.updateStatus("running");
      await this.serverRepo.update(server);
    } catch (err) {
      server.updateStatus("error");
      await this.serverRepo.update(server);
      throw err;
    }
  }
}
