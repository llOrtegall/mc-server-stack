import { config } from '../../../config.js';
import type { BackupLocationValue } from '../domain/BackupLocation.js';
import type { BackupStorage } from '../domain/BackupStorage.js';
import type { BackupStorageResolver } from '../domain/BackupStorageResolver.js';
import { LocalBackupStorage } from './LocalBackupStorage.js';
import { S3BackupStorage } from './S3BackupStorage.js';

/** Local storage is always available; cloud (R2) only when configured. */
export class DefaultBackupStorageResolver implements BackupStorageResolver {
  private readonly local = new LocalBackupStorage();
  private readonly s3: S3BackupStorage | null = config.r2
    ? new S3BackupStorage(config.r2)
    : null;

  isAvailable(location: BackupLocationValue): boolean {
    return location === 'local' ? true : this.s3 !== null;
  }

  for(location: BackupLocationValue): BackupStorage {
    if (location === 'local') return this.local;
    if (this.s3 === null) {
      throw new Error(
        '[BackupStorageResolver] Cloud (R2) storage is not configured',
      );
    }
    return this.s3;
  }
}
