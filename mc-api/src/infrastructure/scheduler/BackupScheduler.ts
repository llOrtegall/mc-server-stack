import cron from "node-cron";
import type { IServerRepository } from "../../domain/server/IServerRepository.js";
import type { CreateBackupUseCase } from "../../application/backup/CreateBackupUseCase.js";
import { logger } from "../logger.js";

/**
 * Ejecuta backups automáticos semanales (domingo a las 3:00 AM).
 * Solo hace backup de servidores que están corriendo o detenidos
 * (no en estado de error o iniciando).
 */
export class BackupScheduler {
  private task?: cron.ScheduledTask;

  constructor(
    private readonly serverRepo: IServerRepository,
    private readonly createBackup: CreateBackupUseCase
  ) {}

  start(): void {
    // Domingo a las 3:00 AM (server time)
    this.task = cron.schedule("0 3 * * 0", async () => {
      logger.info("BackupScheduler: Iniciando backups automáticos semanales...");
      const servers = await this.serverRepo.findAll();

      for (const server of servers) {
        if (server.status === "error" || server.status === "starting") continue;
        try {
          await this.createBackup.execute(server.id);
          logger.info(`BackupScheduler: Backup de ${server.name} completado`);
        } catch (err) {
          logger.error(`BackupScheduler: Error en backup de ${server.name}:`, err);
        }
      }
    });
    logger.info("BackupScheduler iniciado (domingos a las 3:00 AM)");
  }

  stop(): void {
    this.task?.stop();
  }
}
