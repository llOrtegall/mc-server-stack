import { createReadStream, createWriteStream } from "fs";
import { mkdir, unlink, readdir, stat } from "fs/promises";
import { join, dirname } from "path";
import type { Readable } from "stream";
import { pipeline } from "stream/promises";
import type { IStorageService } from "./IStorageService.js";
import { logger } from "../logger.js";

/**
 * Almacenamiento de backups en el sistema de archivos local.
 * Se usa en desarrollo cuando R2 no está configurado.
 */
export class LocalStorageService implements IStorageService {
  private readonly basePath: string;

  constructor() {
    this.basePath = process.env.BACKUP_LOCAL_PATH ?? "./data/backups";
  }

  private resolve(key: string): string {
    return join(this.basePath, key);
  }

  async upload(key: string, stream: Readable): Promise<void> {
    const filePath = this.resolve(key);
    await mkdir(dirname(filePath), { recursive: true });
    const writeStream = createWriteStream(filePath);
    await pipeline(stream, writeStream);
    logger.info(`Backup guardado localmente: ${filePath}`);
  }

  async download(key: string): Promise<Readable> {
    return createReadStream(this.resolve(key));
  }

  async delete(key: string): Promise<void> {
    try {
      await unlink(this.resolve(key));
      logger.info(`Backup local eliminado: ${key}`);
    } catch (err: unknown) {
      if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
    }
  }

  async listByPrefix(prefix: string): Promise<string[]> {
    const dirPath = join(this.basePath, dirname(prefix));
    try {
      const files = await readdir(dirPath);
      const baseName = prefix.split("/").pop() ?? "";
      return files
        .filter((f) => f.startsWith(baseName))
        .map((f) => join(dirname(prefix), f));
    } catch {
      return [];
    }
  }
}
