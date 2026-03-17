import type { IServerRepository } from "../../domain/server/IServerRepository.js";
import type { DockerService } from "../../infrastructure/docker/DockerService.js";
import { rm } from "fs/promises";
import { logger } from "../../infrastructure/logger.js";

export class DeleteServerUseCase {
  constructor(
    private readonly serverRepo: IServerRepository,
    private readonly dockerService: DockerService
  ) {}

  async execute(serverId: string): Promise<void> {
    const server = await this.serverRepo.findById(serverId);
    if (!server) throw new Error("Servidor no encontrado");

    // 1. Eliminar contenedor Docker si existe
    if (server.containerId) {
      await this.dockerService.remove(server.containerId);
    }

    // 2. Eliminar datos del disco (mundo, configs, backups locales)
    try {
      await rm(server.dataPath, { recursive: true, force: true });
    } catch (err) {
      logger.warn(`No se pudo eliminar directorio ${server.dataPath}:`, err);
    }

    // 3. Eliminar de BD (cascade elimina backups asociados)
    await this.serverRepo.delete(serverId);
  }
}
