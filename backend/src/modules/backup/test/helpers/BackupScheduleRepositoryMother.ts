import { mock } from 'bun:test';
import type { BackupScheduleRepository } from '../../domain/BackupScheduleRepository.js';

export function create(
  overrides: Partial<BackupScheduleRepository> = {},
): BackupScheduleRepository {
  return {
    getByServer: mock(async () => null),
    upsert: mock(async (schedule) => schedule),
    listEnabled: mock(async () => []),
    ...overrides,
  };
}
