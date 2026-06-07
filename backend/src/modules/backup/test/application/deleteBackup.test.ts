import { describe, expect, it, mock } from 'bun:test';
import { deleteBackup } from '../../application/deleteBackup.js';
import * as BackupMother from '../helpers/BackupMother.js';
import * as BackupRepositoryMother from '../helpers/BackupRepositoryMother.js';
import * as BackupStorageMother from '../helpers/BackupStorageMother.js';
import * as BackupStorageResolverMother from '../helpers/BackupStorageResolverMother.js';

describe('deleteBackup (unit)', () => {
  describe('Basic Behaviour', () => {
    it('removes the object from its storage and the record', async () => {
      const backup = BackupMother.create({
        id: 'b-1',
        serverId: 'srv-1',
        storageKey: 'srv-1/backup.tar.gz',
        location: 'local',
      });
      const backupRepository = BackupRepositoryMother.create({
        getByIdForServer: mock(async () => backup),
      });
      const backupStorage = BackupStorageMother.create();
      const backupStorages = BackupStorageResolverMother.create(backupStorage);

      await deleteBackup({
        backupRepository,
        backupStorages,
        backupId: 'b-1',
        serverId: 'srv-1',
      });

      expect(backupStorages.for).toHaveBeenCalledWith('local');
      expect(backupStorage.delete).toHaveBeenCalledWith('srv-1/backup.tar.gz');
      expect(backupRepository.delete).toHaveBeenCalledWith('b-1');
    });
  });

  describe('Error Scenarios', () => {
    it('throws not found and touches nothing when the backup is missing', async () => {
      const backupRepository = BackupRepositoryMother.create({
        getByIdForServer: mock(async () => null),
      });
      const backupStorage = BackupStorageMother.create();
      const backupStorages = BackupStorageResolverMother.create(backupStorage);

      await expect(
        deleteBackup({
          backupRepository,
          backupStorages,
          backupId: 'missing',
          serverId: 'srv-1',
        }),
      ).rejects.toThrow('not found');
      expect(backupStorage.delete).not.toHaveBeenCalled();
      expect(backupRepository.delete).not.toHaveBeenCalled();
    });
  });
});
