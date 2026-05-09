import { PostgresBackupRepository } from '../infrastructure/PostgresBackupRepository.js';
import { S3BackupStorage } from '../infrastructure/S3BackupStorage.js';
import { TarBackupArchiver } from '../infrastructure/TarBackupArchiver.js';
import { createBackup } from './createBackup.js';
import { deleteBackup } from './deleteBackup.js';
import { listBackups } from './listBackups.js';
import { restoreBackup } from './restoreBackup.js';

const backupRepository = new PostgresBackupRepository();
const backupStorage = new S3BackupStorage();
const backupArchiver = new TarBackupArchiver();

export const backupFactory = {
  createBackup: (serverId: string) =>
    createBackup({ backupRepository, backupStorage, backupArchiver, serverId }),

  listBackups: (serverId: string) =>
    listBackups({ backupRepository, serverId }),

  deleteBackup: (backupId: string, serverId: string) =>
    deleteBackup({ backupRepository, backupStorage, backupId, serverId }),

  restoreBackup: (backupId: string, serverId: string) =>
    restoreBackup({
      backupRepository,
      backupStorage,
      backupArchiver,
      backupId,
      serverId,
    }),
};
