import { mock } from 'bun:test';
import { BackupList } from '../../domain/BackupList.js';
import type { BackupRepository } from '../../domain/BackupRepository.js';

export function create(
  overrides: Partial<BackupRepository> = {},
): BackupRepository {
  return {
    create: mock(async (backup) => backup),
    listByServer: mock(async () => BackupList.create([])),
    getByIdForServer: mock(async () => null),
    delete: mock(async () => true),
    ...overrides,
  };
}
