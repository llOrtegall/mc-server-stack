import type { BackupList } from '../domain/BackupList.js';
import type { BackupRepository } from '../domain/BackupRepository.js';

interface ListBackupsProps {
  backupRepository: BackupRepository;
  serverId: string;
}

export async function listBackups({
  backupRepository,
  serverId,
}: ListBackupsProps): Promise<BackupList> {
  if (!serverId) throw new Error('[listBackups] Server id must be provided');
  return backupRepository.listByServer(serverId);
}
