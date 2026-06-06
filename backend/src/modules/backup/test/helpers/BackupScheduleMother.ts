import { faker } from '@faker-js/faker';
import {
  BackupFrequency,
  type BackupFrequencyValue,
} from '../../domain/BackupFrequency.js';
import {
  BackupLocation,
  type BackupLocationValue,
} from '../../domain/BackupLocation.js';
import { BackupSchedule } from '../../domain/BackupSchedule.js';

interface ScheduleOverrides {
  serverId?: string;
  enabled?: boolean;
  frequency?: BackupFrequencyValue;
  retention?: number;
  location?: BackupLocationValue;
  lastRunAt?: string | null;
}

export function create(overrides: ScheduleOverrides = {}): BackupSchedule {
  return BackupSchedule.create({
    serverId: overrides.serverId ?? faker.string.uuid(),
    enabled: overrides.enabled ?? true,
    frequency: BackupFrequency.create(overrides.frequency ?? 'daily'),
    retention: overrides.retention ?? 7,
    location: BackupLocation.create(overrides.location ?? 'local'),
    lastRunAt: overrides.lastRunAt ?? null,
  });
}
