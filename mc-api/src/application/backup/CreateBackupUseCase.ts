import { createReadStream } from "fs";
import { stat } from "fs/promises";
import { join } from "path";
import archiver from "archiver";
import { createWriteStream } from "fs";
import { tmpdir } from "os";
import { Backup } from "../../domain/backup/Backup.entity.js";
import type { IBackupRepository } from "../../domain/backup/IBackupRepository.js";
import type { IServerRepository } from "../../domain/server/IServerRepository.js";
import type { IStorageService } from "../../infrastructure/storage/IStorageService.js";
import { logger } from "../../infrastructure/logger.js";

export class CreateBackupUseCase {
  constructor(
    private readonly serverRepo: IServerRepository,
    private readonly backupRepo: IBackupRepository,
    private readonly storage: IStorageService
  ) {}

  async execute(serverId: string): Promise<Backup> {
    const server = await this.serverRepo.findById(serverId);
    if (!server) throw new Error("Servidor no encontrado");

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `backup-${server.name}-${timestamp}.tar.gz`;
    const r2Key = `servers/${serverId}/${filename}`;
    const tmpPath = join(tmpdir(), filename);

    logger.info(`Iniciando backup de ${server.name} → ${filename}`);

    // Comprimir el directorio del servidor
    await this.compressDirectory(server.dataPath, tmpPath);

    // Obtener tamaño del archivo comprimido
    const { size } = await stat(tmpPath);

    // Subir a storage (R2 en prod, filesystem local en dev)
    const readStream = createReadStream(tmpPath);
    await this.storage.upload(r2Key, readStream);

    // Registrar en BD
    const backup = Backup.create({
      serverId,
      filename,
      r2Key,
      sizeBytes: size,
    });
    await this.backupRepo.save(backup);

    // Limpiar temporal
    try {
      const { unlink } = await import("fs/promises");
      await unlink(tmpPath);
    } catch {
      // No crítico
    }

    logger.info(`Backup completado: ${filename} (${Math.round(size / 1024 / 1024)}MB)`);
    return backup;
  }

  private compressDirectory(sourcePath: string, destPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const output = createWriteStream(destPath);
      const archive = archiver("tar", { gzip: true, gzipOptions: { level: 6 } });

      output.on("close", resolve);
      archive.on("error", reject);

      archive.pipe(output);
      archive.directory(sourcePath, false);
      archive.finalize();
    });
  }
}
