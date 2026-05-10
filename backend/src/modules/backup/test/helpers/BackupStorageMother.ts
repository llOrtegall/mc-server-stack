import { mock } from 'bun:test';
import type { BackupStorage } from '../../domain/BackupStorage.js';

export function create(overrides: Partial<BackupStorage> = {}): BackupStorage {
  return {
    upload: mock(async () => {}),
    download: mock(async () => '/tmp/restore-test.tar.gz'),
    delete: mock(async () => {}),
    ...overrides,
  };
}
