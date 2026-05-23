import { mock } from 'bun:test';
import type { HostResourcesRepository } from '../../domain/HostResourcesRepository.js';
import * as HostResourcesMother from './HostResourcesMother.js';

export function create(
  overrides: Partial<HostResourcesRepository> = {},
): HostResourcesRepository {
  return {
    get: mock(async () => HostResourcesMother.create()),
    ...overrides,
  };
}
