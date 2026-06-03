import { RconConsoleGateway } from '../../console/infrastructure/RconConsoleGateway.js';
import { PostgresServerRepository } from '../../server/infrastructure/PostgresServerRepository.js';
import type { BackupFrequencyValue } from '../domain/BackupFrequency.js';
import type { BackupLocationValue } from '../domain/BackupLocation.js';
import { DefaultBackupStorageResolver } from '../infrastructure/DefaultBackupStorageResolver.js';
import { PostgresBackupRepository } from '../infrastructure/PostgresBackupRepository.js';
import { PostgresBackupScheduleRepository } from '../infrastructure/PostgresBackupScheduleRepository.js';
import { RconWorldFlusher } from '../infrastructure/RconWorldFlusher.js';
import { TarBackupArchiver } from '../infrastructure/TarBackupArchiver.js';
import { createBackup } from './createBackup.js';
import { deleteBackup } from './deleteBackup.js';
import { getBackupSchedule } from './getBackupSchedule.js';
import { listBackups } from './listBackups.js';
import { restoreBackup } from './restoreBackup.js';
import { saveBackupSchedule } from './saveBackupSchedule.js';

const backupRepository = new PostgresBackupRepository();
const backupStorages = new DefaultBackupStorageResolver();
const backupArchiver = new TarBackupArchiver();
const worldFlusher = new RconWorldFlusher(
  new PostgresServerRepository(),
  new RconConsoleGateway(),
);
const backupScheduleRepository = new PostgresBackupScheduleRepository();

interface SaveScheduleInput {
  enabled: boolean;
  frequency: BackupFrequencyValue;
  retention: number;
  location: BackupLocationValue;
}

export const backupFactory = {
  cloudEnabled: () => backupStorages.isAvailable('s3'),

  createBackup: (serverId: string, location: BackupLocationValue) =>
    createBackup({
      backupRepository,
      backupStorages,
      backupArchiver,
      worldFlusher,
      serverId,
      location,
    }),

  listBackups: (serverId: string) =>
    listBackups({ backupRepository, serverId }),

  deleteBackup: (backupId: string, serverId: string) =>
    deleteBackup({ backupRepository, backupStorages, backupId, serverId }),

  restoreBackup: (backupId: string, serverId: string) =>
    restoreBackup({
      backupRepository,
      backupStorages,
      backupArchiver,
      backupId,
      serverId,
    }),

  getBackupSchedule: (serverId: string) =>
    getBackupSchedule({ backupScheduleRepository, serverId }),

  saveBackupSchedule: (serverId: string, input: SaveScheduleInput) =>
    saveBackupSchedule({
      backupScheduleRepository,
      backupStorages,
      serverId,
      ...input,
    }),
};
