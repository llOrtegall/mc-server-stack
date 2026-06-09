import type { Backup } from './Backup.js';
import type { BackupList } from './BackupList.js';
import type { BackupLocationValue } from './BackupLocation.js';
import type { BackupFrequencyValue, BackupSchedule } from './BackupSchedule.js';

export interface BackupListResult {
  backups: BackupList;
  cloudEnabled: boolean;
}

export interface SaveScheduleInput {
  enabled: boolean;
  frequency: BackupFrequencyValue;
  retention: number;
  location: BackupLocationValue;
}

export interface BackupRepository {
  listByServer: (serverId: string) => Promise<BackupListResult>;
  create: (serverId: string, location: BackupLocationValue) => Promise<Backup>;
  delete: (serverId: string, backupId: string) => Promise<boolean>;
  restore: (serverId: string, backupId: string) => Promise<void>;
  getSchedule: (serverId: string) => Promise<BackupSchedule>;
  saveSchedule: (
    serverId: string,
    input: SaveScheduleInput,
  ) => Promise<BackupSchedule>;
}
