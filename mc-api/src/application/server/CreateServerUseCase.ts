import { mkdir } from "fs/promises";
import { Server, type CreateServerInput } from "../../domain/server/Server.entity.js";
import type { IServerRepository } from "../../domain/server/IServerRepository.js";
import { logger } from "../../infrastructure/logger.js";

export class CreateServerUseCase {
  constructor(private readonly serverRepo: IServerRepository) {}

  async execute(input: Omit<CreateServerInput, "dataBasePath">): Promise<Server> {
    // Verificar que el puerto no esté en uso
    const existing = await this.serverRepo.findByPort(input.port);
    if (existing) {
      throw new Error(`El puerto ${input.port} ya está en uso`);
    }

    const dataBasePath = process.env.MC_DATA_PATH ?? "/data/servers";

    const server = Server.create({ ...input, dataBasePath });

    // Crear el directorio de datos para el servidor
    await mkdir(server.dataPath, { recursive: true });
    logger.info(`Directorio de datos creado: ${server.dataPath}`);

    await this.serverRepo.save(server);
    return server;
  }
}
