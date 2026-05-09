import { Backup } from '../domain/Backup.js';
import type { BackupArchiver } from '../domain/BackupArchiver.js';
import type { BackupRepository } from '../domain/BackupRepository.js';
import type { BackupStorage } from '../domain/BackupStorage.js';
import { StorageKey } from '../domain/StorageKey.js';

interface CreateBackupProps {
  backupRepository: BackupRepository;
  backupStorage: BackupStorage;
  backupArchiver: BackupArchiver;
  serverId: string;
}

export async function createBackup({
  backupRepository,
  backupStorage,
  backupArchiver,
  serverId,
}: CreateBackupProps): Promise<Backup> {
  if (!serverId) throw new Error('[createBackup] Server id must be provided');

  const storageKey = StorageKey.forServerBackup(
    serverId,
    Date.now(),
  ).toPrimitive();

  const { path, sizeBytes } = await backupArchiver.pack(serverId);
  try {
    await backupStorage.upload(storageKey, path, sizeBytes);
  } finally {
    await backupArchiver.discard(path);
  }

  return backupRepository.create(
    Backup.register({ serverId, storageKey, sizeBytes }),
  );
}
