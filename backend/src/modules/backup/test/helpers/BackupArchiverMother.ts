import { mock } from 'bun:test';
import type { BackupArchiver } from '../../domain/BackupArchiver.js';

export function create(
  overrides: Partial<BackupArchiver> = {},
): BackupArchiver {
  return {
    pack: mock(async () => ({
      path: '/tmp/backup-test.tar.gz',
      sizeBytes: 1024,
    })),
    unpackInto: mock(async () => {}),
    discard: mock(async () => {}),
    ...overrides,
  };
}
