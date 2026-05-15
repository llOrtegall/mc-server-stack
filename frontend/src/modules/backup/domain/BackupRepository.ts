import type { Backup } from './Backup.js';
import type { BackupList } from './BackupList.js';

export interface BackupRepository {
  listByServer: (serverId: string) => Promise<BackupList>;
  create: (serverId: string) => Promise<Backup>;
  delete: (serverId: string, backupId: string) => Promise<boolean>;
  restore: (serverId: string, backupId: string) => Promise<void>;
}
