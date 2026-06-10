import type { Backup } from '../domain/Backup.js';
import type { BackupLocationValue } from '../domain/BackupLocation.js';
import type { BackupRepository } from '../domain/BackupRepository.js';

interface CreateBackupProps {
  backupRepository: BackupRepository;
  serverId: string;
  location: BackupLocationValue;
}

export async function createBackup({
  backupRepository,
  serverId,
  location,
}: CreateBackupProps): Promise<Backup> {
  if (!serverId) throw new Error('[createBackup] Server id must be provided');
  return backupRepository.create(serverId, location);
}
