import type { BackupLocationValue } from '../domain/BackupLocation.js';
import type { SaveScheduleInput } from '../domain/BackupRepository.js';
import { HttpBackupRepository } from '../infrastructure/HttpBackupRepository.js';
import { createBackup } from './createBackup.js';
import { deleteBackup } from './deleteBackup.js';
import { getBackupSchedule } from './getBackupSchedule.js';
import { listBackups } from './listBackups.js';
import { restoreBackup } from './restoreBackup.js';
import { saveBackupSchedule } from './saveBackupSchedule.js';

const backupRepository = new HttpBackupRepository();

export const backupFactory = {
  listBackups: (serverId: string) =>
    listBackups({ backupRepository, serverId }),
  createBackup: (serverId: string, location: BackupLocationValue) =>
    createBackup({ backupRepository, serverId, location }),
  deleteBackup: (serverId: string, backupId: string) =>
    deleteBackup({ backupRepository, serverId, backupId }),
  restoreBackup: (serverId: string, backupId: string) =>
    restoreBackup({ backupRepository, serverId, backupId }),
  getBackupSchedule: (serverId: string) =>
    getBackupSchedule({ backupRepository, serverId }),
  saveBackupSchedule: (serverId: string, input: SaveScheduleInput) =>
    saveBackupSchedule({ backupRepository, serverId, input }),
};
