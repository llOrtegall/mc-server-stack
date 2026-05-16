import type { BackupRepository } from '../domain/BackupRepository.js';

interface RestoreBackupProps {
  backupRepository: BackupRepository;
  serverId: string;
  backupId: string;
}

export function restoreBackup({
  backupRepository,
  serverId,
  backupId,
}: RestoreBackupProps): Promise<void> {
  return backupRepository.restore(serverId, backupId);
}
