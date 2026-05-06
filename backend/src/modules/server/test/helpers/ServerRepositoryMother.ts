import { mock } from 'bun:test';
import { ServerList } from '../../domain/ServerList.js';
import type { ServerRepository } from '../../domain/ServerRepository.js';

export function create(
  overrides: Partial<ServerRepository> = {},
): ServerRepository {
  return {
    create: mock(async (server) => server),
    getById: mock(async () => null),
    getAll: mock(async () => ServerList.create([])),
    update: mock(async (server) => server),
    delete: mock(async () => true),
    ...overrides,
  };
}
