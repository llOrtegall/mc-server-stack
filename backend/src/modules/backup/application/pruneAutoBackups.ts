import type { BackupLocationValue } from '../domain/BackupLocation.js';
import type { BackupRepository } from '../domain/BackupRepository.js';
import type { BackupStorageResolver } from '../domain/BackupStorageResolver.js';

interface PruneAutoBackupsProps {
  backupRepository: BackupRepository;
  backupStorages: BackupStorageResolver;
  serverId: string;
  location: BackupLocationValue;
  retention: number;
}

/** Keeps the newest `retention` automatic backups for a server+location. */
export async function pruneAutoBackups({
  backupRepository,
  backupStorages,
  serverId,
  location,
  retention,
}: PruneAutoBackupsProps): Promise<void> {
  const list = await backupRepository.listAutoByServerAndLocation(
    serverId,
    location,
  );
  // listAutoByServerAndLocation returns newest first; anything past the
  // retention window is stale and gets removed (storage + record).
  const stale = list.toArray().slice(retention);
  for (const backup of stale) {
    const id = backup.getId();
    if (id === null) continue;
    await backupStorages
      .for(backup.getLocation())
      .delete(backup.getStorageKey());
    await backupRepository.delete(id);
  }
}
