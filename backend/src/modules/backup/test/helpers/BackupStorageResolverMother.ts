import { mock } from 'bun:test';
import type { BackupStorage } from '../../domain/BackupStorage.js';
import type { BackupStorageResolver } from '../../domain/BackupStorageResolver.js';
import * as BackupStorageMother from './BackupStorageMother.js';

/** Resolver that always returns the given storage (so tests can assert on it). */
export function create(
  storage: BackupStorage = BackupStorageMother.create(),
  overrides: Partial<BackupStorageResolver> = {},
): BackupStorageResolver {
  return {
    for: mock(() => storage),
    isAvailable: mock(() => true),
    ...overrides,
  };
}
