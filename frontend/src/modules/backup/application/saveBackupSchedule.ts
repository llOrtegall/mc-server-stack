import type {
  BackupRepository,
  SaveScheduleInput,
} from '../domain/BackupRepository.js';
import type { BackupSchedule } from '../domain/BackupSchedule.js';

interface SaveBackupScheduleProps {
  backupRepository: BackupRepository;
  serverId: string;
  input: SaveScheduleInput;
}

export function saveBackupSchedule({
  backupRepository,
  serverId,
  input,
}: SaveBackupScheduleProps): Promise<BackupSchedule> {
  return backupRepository.saveSchedule(serverId, input);
}
