import { copyFile, mkdir, rm } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { config } from '../../../config.js';
import type { BackupStorage } from '../domain/BackupStorage.js';

/** Stores backup archives on the local volume (config.backupLocalPath). */
export class LocalBackupStorage implements BackupStorage {
  private readonly basePath = config.backupLocalPath;

  private pathFor(key: string): string {
    return join(this.basePath, key);
  }

  async upload(
    key: string,
    filePath: string,
    _sizeBytes: number,
  ): Promise<void> {
    const dest = this.pathFor(key);
    await mkdir(dirname(dest), { recursive: true });
    await copyFile(filePath, dest);
  }

  async download(key: string): Promise<string> {
    // Copy to /tmp so the caller can freely discard it without touching the
    // stored archive (restore deletes the downloaded path afterwards).
    const destPath = join('/tmp', `restore-${Date.now()}.tar.gz`);
    await copyFile(this.pathFor(key), destPath);
    return destPath;
  }

  async delete(key: string): Promise<void> {
    await rm(this.pathFor(key), { force: true });
  }
}
