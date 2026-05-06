import { mock } from 'bun:test';
import { faker } from '@faker-js/faker';
import type { ServerRuntime } from '../../domain/ServerRuntime.js';

export function create(overrides: Partial<ServerRuntime> = {}): ServerRuntime {
  return {
    provision: mock(async () => faker.string.alphanumeric(12)),
    start: mock(async () => {}),
    stop: mock(async () => {}),
    restart: mock(async () => {}),
    remove: mock(async () => {}),
    ...overrides,
  };
}
