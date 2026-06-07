import { describe, expect, it, mock } from 'bun:test';
import { pruneAutoBackups } from '../../application/pruneAutoBackups.js';
import { BackupList } from '../../domain/BackupList.js';
import * as BackupMother from '../helpers/BackupMother.js';
import * as BackupRepositoryMother from '../helpers/BackupRepositoryMother.js';
import * as BackupStorageMother from '../helpers/BackupStorageMother.js';
import * as BackupStorageResolverMother from '../helpers/BackupStorageResolverMother.js';

describe('pruneAutoBackups (unit)', () => {
  describe('Basic Behaviour', () => {
    it('deletes auto backups beyond retention, keeping the newest', async () => {
      // listAutoByServerAndLocation returns newest first.
      const backups = [
        BackupMother.create({ id: 'b1', auto: true, storageKey: 'k1' }),
        BackupMother.create({ id: 'b2', auto: true, storageKey: 'k2' }),
        BackupMother.create({ id: 'b3', auto: true, storageKey: 'k3' }),
      ];
      const backupRepository = BackupRepositoryMother.create({
        listAutoByServerAndLocation: mock(async () =>
          BackupList.create(backups),
        ),
      });
      const backupStorage = BackupStorageMother.create();
      const backupStorages = BackupStorageResolverMother.create(backupStorage);

      await pruneAutoBackups({
        backupRepository,
        backupStorages,
        serverId: 'srv-1',
        location: 'local',
        retention: 2,
      });

      expect(backupStorage.delete).toHaveBeenCalledTimes(1);
      expect(backupStorage.delete).toHaveBeenCalledWith('k3');
      expect(backupRepository.delete).toHaveBeenCalledWith('b3');
    });
  });

  describe('Edge Cases', () => {
    it('keeps everything when within the retention window', async () => {
      const backups = [
        BackupMother.create({ auto: true }),
        BackupMother.create({ auto: true }),
      ];
      const backupRepository = BackupRepositoryMother.create({
        listAutoByServerAndLocation: mock(async () =>
          BackupList.create(backups),
        ),
      });
      const backupStorage = BackupStorageMother.create();
      const backupStorages = BackupStorageResolverMother.create(backupStorage);

      await pruneAutoBackups({
        backupRepository,
        backupStorages,
        serverId: 'srv-1',
        location: 'local',
        retention: 5,
      });

      expect(backupStorage.delete).not.toHaveBeenCalled();
      expect(backupRepository.delete).not.toHaveBeenCalled();
    });
  });
});
