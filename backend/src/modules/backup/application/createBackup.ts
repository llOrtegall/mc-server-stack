import { Backup } from '../domain/Backup.js';
import type { BackupArchiver } from '../domain/BackupArchiver.js';
import type { BackupLocationValue } from '../domain/BackupLocation.js';
import type { BackupRepository } from '../domain/BackupRepository.js';
import type { BackupStorageResolver } from '../domain/BackupStorageResolver.js';
import { StorageKey } from '../domain/StorageKey.js';
import type { WorldFlusher } from '../domain/WorldFlusher.js';

interface CreateBackupProps {
  backupRepository: BackupRepository;
  backupStorages: BackupStorageResolver;
  backupArchiver: BackupArchiver;
  worldFlusher: WorldFlusher;
  serverId: string;
  location: BackupLocationValue;
  auto?: boolean;
}

export async function createBackup({
  backupRepository,
  backupStorages,
  backupArchiver,
  worldFlusher,
  serverId,
  location,
  auto = false,
}: CreateBackupProps): Promise<Backup> {
  if (!serverId) throw new Error('[createBackup] Server id must be provided');

  // Resolve the target storage up front so an unavailable destination fails
  // before any archiving work is done.
  const storage = backupStorages.for(location);

  const storageKey = StorageKey.forServerBackup(
    serverId,
    Date.now(),
  ).toPrimitive();

  // Flush the running world to disk while archiving (no-op if stopped).
  await worldFlusher.flush(serverId);
  let path: string;
  let sizeBytes: number;
  try {
    ({ path, sizeBytes } = await backupArchiver.pack(serverId));
  } finally {
    await worldFlusher.resume(serverId);
  }

  try {
    await storage.upload(storageKey, path, sizeBytes);
  } finally {
    await backupArchiver.discard(path);
  }

  return backupRepository.create(
    Backup.register({ serverId, storageKey, location, auto, sizeBytes }),
  );
}
