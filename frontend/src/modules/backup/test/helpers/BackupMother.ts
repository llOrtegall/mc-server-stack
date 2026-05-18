import { faker } from '@faker-js/faker';
import { Backup, type BackupPrimitives } from '../../domain/Backup.js';

export function create(overrides: Partial<BackupPrimitives> = {}): Backup {
  const serverId = overrides.serverId ?? faker.string.uuid();
  return Backup.fromPrimitive({
    id: faker.string.uuid(),
    serverId,
    storageKey: `${serverId}/backup.tar.gz`,
    sizeBytes: faker.number.int({ min: 1024, max: 1_000_000 }),
    createdAt: faker.date.past().toISOString(),
    ...overrides,
  });
}
