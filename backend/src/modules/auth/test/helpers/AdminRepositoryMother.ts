import { mock } from 'bun:test';
import type { AdminRepository } from '../../domain/AdminRepository.js';

export function create(
  overrides: Partial<AdminRepository> = {},
): AdminRepository {
  return {
    getByEmail: mock(async () => null),
    getById: mock(async () => null),
    create: mock(async (admin) => admin),
    count: mock(async () => 0),
    ...overrides,
  };
}
