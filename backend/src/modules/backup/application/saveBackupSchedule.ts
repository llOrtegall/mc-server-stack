import {
  BackupFrequency,
  type BackupFrequencyValue,
} from '../domain/BackupFrequency.js';
import {
  BackupLocation,
  type BackupLocationValue,
} from '../domain/BackupLocation.js';
import { BackupSchedule } from '../domain/BackupSchedule.js';
import type { BackupScheduleRepository } from '../domain/BackupScheduleRepository.js';
import type { BackupStorageResolver } from '../domain/BackupStorageResolver.js';

interface SaveBackupScheduleProps {
  backupScheduleRepository: BackupScheduleRepository;
  backupStorages: BackupStorageResolver;
  serverId: string;
  enabled: boolean;
  frequency: BackupFrequencyValue;
  retention: number;
  location: BackupLocationValue;
}

export async function saveBackupSchedule({
  backupScheduleRepository,
  backupStorages,
  serverId,
  enabled,
  frequency,
  retention,
  location,
}: SaveBackupScheduleProps): Promise<BackupSchedule> {
  if (!serverId) {
    throw new Error('[saveBackupSchedule] Server id must be provided');
  }
  if (!backupStorages.isAvailable(location)) {
    throw new Error(
      '[saveBackupSchedule] Selected backup location is not available',
    );
  }

  // Preserve the last run so toggling config does not re-trigger immediately.
  const existing = await backupScheduleRepository.getByServer(serverId);
  const schedule = BackupSchedule.create({
    serverId,
    enabled,
    frequency: BackupFrequency.create(frequency),
    retention,
    location: BackupLocation.create(location),
    lastRunAt: existing?.toPrimitive().lastRunAt ?? null,
  });

  return backupScheduleRepository.upsert(schedule);
}
