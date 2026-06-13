import { BackupList } from '../../domain/BackupList.js';
import type { BackupRepository } from '../../domain/BackupRepository.js';
import * as BackupMother from './BackupMother.js';
import * as BackupScheduleMother from './BackupScheduleMother.js';

export function create(
  overrides: Partial<BackupRepository> = {},
): BackupRepository {
  return {
    listByServer: vi.fn(async () => ({
      backups: BackupList.create([]),
      cloudEnabled: false,
    })),
    create: vi.fn(async () => BackupMother.create()),
    delete: vi.fn(async () => true),
    restore: vi.fn(async () => {}),
    getSchedule: vi.fn(async () => BackupScheduleMother.create()),
    saveSchedule: vi.fn(async () => BackupScheduleMother.create()),
    ...overrides,
  };
}
