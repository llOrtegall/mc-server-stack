import { mock } from 'bun:test';
import type { TokenRepository } from '../../domain/TokenRepository.js';

export function create(
  overrides: Partial<TokenRepository> = {},
): TokenRepository {
  return {
    sign: mock(() => 'signed-token'),
    verify: mock(() => ({ id: 'admin-id' })),
    ...overrides,
  };
}
