import cron from "node-cron";
import type { IServerRepository } from "../../domain/server/IServerRepository.js";
import type { RconService } from "../rcon/RconService.js";
import type { StopServerUseCase } from "../../application/server/StopServerUseCase.js";
import { logger } from "../logger.js";
import { DockerFactory } from "../docker/DockerFactory.js";

/**
 * Apagado automático — revisa cada 5 minutos si hay servidores
 * que llevan más de AUTO_SHUTDOWN_MINUTES sin jugadores conectados.
 *
 * Flujo:
 * 1. Obtener lista de servidores en estado "running"
 * 2. Para cada uno, consultar players via RCON
 * 3. Si 0 jugadores: registrar timestamp "lastPlayerLeftAt"
 * 4. Si ya lleva más de N minutos sin jugadores → apagar
 */
export class AutoShutdownScheduler {
  private task?: cron.ScheduledTask;
  private readonly shutdownMinutes: number;

  constructor(
    private readonly serverRepo: IServerRepository,
    private readonly rconService: RconService,
    private readonly stopServer: StopServerUseCase
  ) {
    this.shutdownMinutes = parseInt(
      process.env.AUTO_SHUTDOWN_MINUTES ?? "10",
      10
    );
  }

  start(): void {
    // Cada 5 minutos
    this.task = cron.schedule("*/5 * * * *", async () => {
      await this.check();
    });
    logger.info(
      `AutoShutdownScheduler iniciado (apagado tras ${this.shutdownMinutes} min sin jugadores)`
    );
  }

  private async check(): Promise<void> {
    const servers = await this.serverRepo.findAll();
    const runningServers = servers.filter(
      (s) => s.status === "running" && s.autoShutdownEnabled
    );

    for (const server of runningServers) {
      try {
        const containerName = DockerFactory.getContainerName(server.id);
        const result = await this.rconService.getPlayerList(
          containerName, // Docker resolverá el nombre del contenedor como hostname
          server.rconPort,
          server.rconPassword
        );

        if (result.count > 0) {
          // Hay jugadores, resetear el timer si estaba activo
          if (server.lastPlayerLeftAt !== null) {
            server.clearLastPlayerLeft();
            await this.serverRepo.update(server);
          }
          continue;
        }

        // 0 jugadores
        if (!server.lastPlayerLeftAt) {
          // Primera vez que vemos 0 jugadores, registrar timestamp
          server.recordPlayerLeft();
          await this.serverRepo.update(server);
          logger.debug(`AutoShutdown: ${server.name} sin jugadores, iniciando timer`);
          continue;
        }

        // Calcular cuánto tiempo lleva sin jugadores
        const emptyMinutes =
          (Date.now() - server.lastPlayerLeftAt.getTime()) / 1000 / 60;

        if (emptyMinutes >= this.shutdownMinutes) {
          logger.info(
            `AutoShutdown: Apagando ${server.name} (${Math.round(emptyMinutes)} min sin jugadores)`
          );
          await this.stopServer.execute(server.id);
        }
      } catch (err) {
        logger.debug(`AutoShutdown: Error al verificar ${server.name}:`, err);
      }
    }
  }

  stop(): void {
    this.task?.stop();
  }
}
