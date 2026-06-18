import { mock } from 'bun:test';
import { faker } from '@faker-js/faker';
import type { ConsoleServer } from '../../domain/ConsoleServer.js';
import type { ConsoleServerRepository } from '../../domain/ConsoleServerRepository.js';

export function consoleServer(
  overrides: Partial<ConsoleServer> = {},
): ConsoleServer {
  return {
    containerId: faker.string.alphanumeric(12),
    edition: 'java',
    rconPort: faker.number.int({ min: 1025, max: 65000 }),
    rconPassword: faker.string.hexadecimal({ length: 16, prefix: '' }),
    status: 'running',
    ...overrides,
  };
}

export function create(
  overrides: Partial<ConsoleServerRepository> = {},
): ConsoleServerRepository {
  return {
    findById: mock(async () => consoleServer()),
    ...overrides,
  };
}
