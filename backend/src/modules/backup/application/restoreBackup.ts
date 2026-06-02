import type { BackupArchiver } from '../domain/BackupArchiver.js';
import type { BackupRepository } from '../domain/BackupRepository.js';
import type { BackupStorageResolver } from '../domain/BackupStorageResolver.js';

interface RestoreBackupProps {
  backupRepository: BackupRepository;
  backupStorages: BackupStorageResolver;
  backupArchiver: BackupArchiver;
  backupId: string;
  serverId: string;
}

export async function restoreBackup({
  backupRepository,
  backupStorages,
  backupArchiver,
  backupId,
  serverId,
}: RestoreBackupProps): Promise<void> {
  const backup = await backupRepository.getByIdForServer(backupId, serverId);
  if (backup === null) throw new Error('[restoreBackup] Backup not found');

  const storage = backupStorages.for(backup.getLocation());
  const path = await storage.download(backup.getStorageKey());
  try {
    await backupArchiver.unpackInto(serverId, path);
  } finally {
    await backupArchiver.discard(path);
  }
}
