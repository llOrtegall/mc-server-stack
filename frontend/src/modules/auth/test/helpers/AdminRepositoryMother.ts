import type { AdminRepository } from '../../domain/AdminRepository.js';
import * as AdminMother from './AdminMother.js';

export function create(
  overrides: Partial<AdminRepository> = {},
): AdminRepository {
  return {
    login: vi.fn(async () => ({ token: 'token', admin: AdminMother.create() })),
    getMe: vi.fn(async () => AdminMother.create()),
    ...overrides,
  };
}
