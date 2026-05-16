import type { BackupList } from '../domain/BackupList.js';
import type { BackupRepository } from '../domain/BackupRepository.js';

interface ListBackupsProps {
  backupRepository: BackupRepository;
  serverId: string;
}

export function listBackups({
  backupRepository,
  serverId,
}: ListBackupsProps): Promise<BackupList> {
  return backupRepository.listByServer(serverId);
}
