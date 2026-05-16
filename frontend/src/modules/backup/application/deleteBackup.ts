import type { BackupRepository } from '../domain/BackupRepository.js';

interface DeleteBackupProps {
  backupRepository: BackupRepository;
  serverId: string;
  backupId: string;
}

export function deleteBackup({
  backupRepository,
  serverId,
  backupId,
}: DeleteBackupProps): Promise<boolean> {
  return backupRepository.delete(serverId, backupId);
}
