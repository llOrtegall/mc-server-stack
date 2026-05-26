import { ServerList } from '../../domain/ServerList.js';
import type { ServerRepository } from '../../domain/ServerRepository.js';
import * as ServerMother from './ServerMother.js';

export function create(
  overrides: Partial<ServerRepository> = {},
): ServerRepository {
  return {
    getAll: vi.fn(async () => ServerList.create([])),
    getById: vi.fn(async () => null),
    create: vi.fn(async () => ServerMother.create()),
    update: vi.fn(async () => ServerMother.create()),
    start: vi.fn(async () => {}),
    stop: vi.fn(async () => {}),
    restart: vi.fn(async () => {}),
    delete: vi.fn(async () => true),
    ...overrides,
  };
}
