import type { BackupSchedule } from './BackupSchedule.js';

export interface BackupScheduleRepository {
  getByServer: (serverId: string) => Promise<BackupSchedule | null>;
  upsert: (schedule: BackupSchedule) => Promise<BackupSchedule>;
  /** All enabled schedules — used by the scheduler to find due backups. */
  listEnabled: () => Promise<BackupSchedule[]>;
}
