import { faker } from '@faker-js/faker';
import { Backup } from '../../domain/Backup.js';
import { StorageKey } from '../../domain/StorageKey.js';

interface BackupOverrides {
  id?: string | null;
  serverId?: string;
  storageKey?: string;
  sizeBytes?: number | null;
}

export function create(overrides: BackupOverrides = {}): Backup {
  const serverId = overrides.serverId ?? faker.string.uuid();
  return Backup.create({
    id: overrides.id === undefined ? faker.string.uuid() : overrides.id,
    serverId,
    storageKey: StorageKey.create(
      overrides.storageKey ??
        `${serverId}/backup-${serverId}-${Date.now()}.tar.gz`,
    ),
    sizeBytes:
      overrides.sizeBytes === undefined
        ? faker.number.int({ min: 1, max: 1_000_000 })
        : overrides.sizeBytes,
  });
}
