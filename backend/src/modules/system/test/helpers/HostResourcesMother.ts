import { faker } from '@faker-js/faker';
import { HostResources } from '../../domain/HostResources.js';

interface HostResourcesOverrides {
  cpuCores?: number;
  memoryMb?: number;
}

export function create(overrides: HostResourcesOverrides = {}): HostResources {
  return HostResources.create(
    overrides.cpuCores ?? faker.number.int({ min: 1, max: 16 }),
    overrides.memoryMb ?? faker.number.int({ min: 1024, max: 65536 }),
  );
}
