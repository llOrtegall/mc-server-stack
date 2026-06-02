import type { BackupRepository } from '../domain/BackupRepository.js';
import type { BackupStorageResolver } from '../domain/BackupStorageResolver.js';

interface DeleteBackupProps {
  backupRepository: BackupRepository;
  backupStorages: BackupStorageResolver;
  backupId: string;
  serverId: string;
}

export async function deleteBackup({
  backupRepository,
  backupStorages,
  backupId,
  serverId,
}: DeleteBackupProps): Promise<void> {
  const backup = await backupRepository.getByIdForServer(backupId, serverId);
  if (backup === null) throw new Error('[deleteBackup] Backup not found');

  await backupStorages.for(backup.getLocation()).delete(backup.getStorageKey());
  await backupRepository.delete(backupId);
}
