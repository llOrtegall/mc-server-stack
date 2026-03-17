import type { Backup } from "./Backup.entity.js";

export interface IBackupRepository {
  findByServerId(serverId: string): Promise<Backup[]>;
  findById(id: string): Promise<Backup | null>;
  save(backup: Backup): Promise<void>;
  delete(id: string): Promise<void>;
}
