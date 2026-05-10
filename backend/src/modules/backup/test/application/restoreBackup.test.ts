import { describe, expect, it, mock } from 'bun:test';
import { restoreBackup } from '../../application/restoreBackup.js';
import * as BackupArchiverMother from '../helpers/BackupArchiverMother.js';
import * as BackupMother from '../helpers/BackupMother.js';
import * as BackupRepositoryMother from '../helpers/BackupRepositoryMother.js';
import * as BackupStorageMother from '../helpers/BackupStorageMother.js';

describe('restoreBackup (unit)', () => {
  describe('Basic Behaviour', () => {
    it('downloads the archive, unpacks it into the server dir and discards the temp file', async () => {
      const backup = BackupMother.create({
        id: 'b-1',
        serverId: 'srv-1',
        storageKey: 'srv-1/backup.tar.gz',
      });
      const backupRepository = BackupRepositoryMother.create({
        getByIdForServer: mock(async () => backup),
      });
      const backupStorage = BackupStorageMother.create({
        download: mock(async () => '/tmp/restore.tar.gz'),
      });
      const backupArchiver = BackupArchiverMother.create();

      await restoreBackup({
        backupRepository,
        backupStorage,
        backupArchiver,
        backupId: 'b-1',
        serverId: 'srv-1',
      });

      expect(backupStorage.download).toHaveBeenCalledWith(
        'srv-1/backup.tar.gz',
      );
      expect(backupArchiver.unpackInto).toHaveBeenCalledWith(
        'srv-1',
        '/tmp/restore.tar.gz',
      );
      expect(backupArchiver.discard).toHaveBeenCalledWith(
        '/tmp/restore.tar.gz',
      );
    });
  });

  describe('Error Scenarios', () => {
    it('throws not found and never downloads when the backup is missing', async () => {
      const backupRepository = BackupRepositoryMother.create({
        getByIdForServer: mock(async () => null),
      });
      const backupStorage = BackupStorageMother.create();
      const backupArchiver = BackupArchiverMother.create();

      await expect(
        restoreBackup({
          backupRepository,
          backupStorage,
          backupArchiver,
          backupId: 'missing',
          serverId: 'srv-1',
        }),
      ).rejects.toThrow('not found');
      expect(backupStorage.download).not.toHaveBeenCalled();
    });
  });
});
