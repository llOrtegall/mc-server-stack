import type { Backup } from '../domain/Backup.js';
import type { BackupRepository } from '../domain/BackupRepository.js';

interface CreateBackupProps {
  backupRepository: BackupRepository;
  serverId: string;
}

export function createBackup({
  backupRepository,
  serverId,
}: CreateBackupProps): Promise<Backup> {
  if (!serverId) throw new Error('[createBackup] Server id must be provided');
  return backupRepository.create(serverId);
}
