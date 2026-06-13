import { faker } from '@faker-js/faker';
import {
  BackupSchedule,
  type BackupSchedulePrimitives,
} from '../../domain/BackupSchedule.js';

export function create(
  overrides: Partial<BackupSchedulePrimitives> = {},
): BackupSchedule {
  return BackupSchedule.fromPrimitive({
    serverId: faker.string.uuid(),
    enabled: false,
    frequency: 'daily',
    retention: 7,
    location: 'local',
    lastRunAt: null,
    ...overrides,
  });
}
