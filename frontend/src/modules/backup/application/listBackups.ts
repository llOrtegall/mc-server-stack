import type {
  BackupListResult,
  BackupRepository,
} from '../domain/BackupRepository.js';

interface ListBackupsProps {
  backupRepository: BackupRepository;
  serverId: string;
}

export function listBackups({
  backupRepository,
  serverId,
}: ListBackupsProps): Promise<BackupListResult> {
  return backupRepository.listByServer(serverId);
}
