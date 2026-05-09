import type { BackupRepository } from '../domain/BackupRepository.js';
import type { BackupStorage } from '../domain/BackupStorage.js';

interface DeleteBackupProps {
  backupRepository: BackupRepository;
  backupStorage: BackupStorage;
  backupId: string;
  serverId: string;
}

export async function deleteBackup({
  backupRepository,
  backupStorage,
  backupId,
  serverId,
}: DeleteBackupProps): Promise<void> {
  const backup = await backupRepository.getByIdForServer(backupId, serverId);
  if (backup === null) throw new Error('[deleteBackup] Backup not found');

  await backupStorage.delete(backup.getStorageKey());
  await backupRepository.delete(backupId);
}
