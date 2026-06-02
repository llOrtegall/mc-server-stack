import { BackupSchedule } from '../domain/BackupSchedule.js';
import type { BackupScheduleRepository } from '../domain/BackupScheduleRepository.js';

interface GetBackupScheduleProps {
  backupScheduleRepository: BackupScheduleRepository;
  serverId: string;
}

export async function getBackupSchedule({
  backupScheduleRepository,
  serverId,
}: GetBackupScheduleProps): Promise<BackupSchedule> {
  if (!serverId)
    throw new Error('[getBackupSchedule] Server id must be provided');
  const existing = await backupScheduleRepository.getByServer(serverId);
  return existing ?? BackupSchedule.default(serverId);
}
