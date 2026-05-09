import type { Backup } from './Backup.js';
import type { BackupList } from './BackupList.js';

export interface BackupRepository {
  create: (backup: Backup) => Promise<Backup>;
  listByServer: (serverId: string) => Promise<BackupList>;
  getByIdForServer: (id: string, serverId: string) => Promise<Backup | null>;
  delete: (id: string) => Promise<boolean>;
}
