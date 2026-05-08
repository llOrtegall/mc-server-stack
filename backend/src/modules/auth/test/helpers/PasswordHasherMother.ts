import { mock } from 'bun:test';
import type { PasswordHasher } from '../../domain/PasswordHasher.js';

export function create(
  overrides: Partial<PasswordHasher> = {},
): PasswordHasher {
  return {
    hash: mock(async () => 'hashed-password'),
    compare: mock(async () => true),
    ...overrides,
  };
}
