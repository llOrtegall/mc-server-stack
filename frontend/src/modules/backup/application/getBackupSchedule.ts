import type { BackupRepository } from '../domain/BackupRepository.js';
import type { BackupSchedule } from '../domain/BackupSchedule.js';

interface GetBackupScheduleProps {
  backupRepository: BackupRepository;
  serverId: string;
}

export function getBackupSchedule({
  backupRepository,
  serverId,
}: GetBackupScheduleProps): Promise<BackupSchedule> {
  return backupRepository.getSchedule(serverId);
}
