import { faker } from '@faker-js/faker';
import {
  HostResources,
  type HostResourcesPrimitives,
} from '../../domain/HostResources.js';

export function create(
  overrides: Partial<HostResourcesPrimitives> = {},
): HostResources {
  return HostResources.fromPrimitive({
    cpuCores: faker.number.int({ min: 1, max: 16 }),
    memoryMb: faker.number.int({ min: 1024, max: 65536 }),
    ...overrides,
  });
}
