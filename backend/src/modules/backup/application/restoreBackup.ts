import type { BackupArchiver } from '../domain/BackupArchiver.js';
import type { BackupRepository } from '../domain/BackupRepository.js';
import type { BackupStorage } from '../domain/BackupStorage.js';

interface RestoreBackupProps {
  backupRepository: BackupRepository;
  backupStorage: BackupStorage;
  backupArchiver: BackupArchiver;
  backupId: string;
  serverId: string;
}

export async function restoreBackup({
  backupRepository,
  backupStorage,
  backupArchiver,
  backupId,
  serverId,
}: RestoreBackupProps): Promise<void> {
  const backup = await backupRepository.getByIdForServer(backupId, serverId);
  if (backup === null) throw new Error('[restoreBackup] Backup not found');

  const path = await backupStorage.download(backup.getStorageKey());
  try {
    await backupArchiver.unpackInto(serverId, path);
  } finally {
    await backupArchiver.discard(path);
  }
}
