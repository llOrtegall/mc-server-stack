import { faker } from '@faker-js/faker';
import { Server, type ServerPrimitives } from '../../domain/Server.js';
import { DEFAULT_PROPERTIES } from '../../domain/ServerProperties.js';

export function create(overrides: Partial<ServerPrimitives> = {}): Server {
  const port = overrides.port ?? faker.number.int({ min: 1024, max: 65000 });
  return Server.fromPrimitive({
    id: faker.string.uuid(),
    name: faker.lorem.words(2),
    edition: 'java',
    version: '1.21.4',
    port,
    rconPort: port + 1,
    containerId: faker.string.alphanumeric(12),
    status: 'stopped',
    ramMb: 1024,
    cpuLimit: 1,
    properties: DEFAULT_PROPERTIES,
    createdAt: faker.date.past().toISOString(),
    updatedAt: faker.date.recent().toISOString(),
    ...overrides,
  });
}
