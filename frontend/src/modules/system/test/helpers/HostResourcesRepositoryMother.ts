import type { HostResourcesRepository } from '../../domain/HostResourcesRepository.js';
import * as HostResourcesMother from './HostResourcesMother.js';

export function create(
  overrides: Partial<HostResourcesRepository> = {},
): HostResourcesRepository {
  return {
    get: vi.fn(async () => HostResourcesMother.create()),
    ...overrides,
  };
}
