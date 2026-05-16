import { HttpBackupRepository } from '../infrastructure/HttpBackupRepository.js';
import { createBackup } from './createBackup.js';
import { deleteBackup } from './deleteBackup.js';
import { listBackups } from './listBackups.js';
import { restoreBackup } from './restoreBackup.js';

const backupRepository = new HttpBackupRepository();

export const backupFactory = {
  listBackups: (serverId: string) =>
    listBackups({ backupRepository, serverId }),
  createBackup: (serverId: string) =>
    createBackup({ backupRepository, serverId }),
  deleteBackup: (serverId: string, backupId: string) =>
    deleteBackup({ backupRepository, serverId, backupId }),
  restoreBackup: (serverId: string, backupId: string) =>
    restoreBackup({ backupRepository, serverId, backupId }),
};
