import { BackupList } from '../../domain/BackupList.js';
import type { BackupRepository } from '../../domain/BackupRepository.js';
import * as BackupMother from './BackupMother.js';

export function create(
  overrides: Partial<BackupRepository> = {},
): BackupRepository {
  return {
    listByServer: vi.fn(async () => BackupList.create([])),
    create: vi.fn(async () => BackupMother.create()),
    delete: vi.fn(async () => true),
    restore: vi.fn(async () => {}),
    ...overrides,
  };
}
