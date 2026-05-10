import { describe, expect, it, mock } from 'bun:test';
import { createBackup } from '../../application/createBackup.js';
import * as BackupArchiverMother from '../helpers/BackupArchiverMother.js';
import * as BackupRepositoryMother from '../helpers/BackupRepositoryMother.js';
import * as BackupStorageMother from '../helpers/BackupStorageMother.js';

describe('createBackup (unit)', () => {
  describe('Basic Behaviour', () => {
    it('packs, uploads, discards the temp file and stores the record', async () => {
      const backupRepository = BackupRepositoryMother.create();
      const backupStorage = BackupStorageMother.create();
      const backupArchiver = BackupArchiverMother.create({
        pack: mock(async () => ({ path: '/tmp/b.tar.gz', sizeBytes: 2048 })),
      });

      const result = await createBackup({
        backupRepository,
        backupStorage,
        backupArchiver,
        serverId: 'srv-1',
      });

      expect(backupArchiver.pack).toHaveBeenCalledWith('srv-1');
      expect(backupStorage.upload).toHaveBeenCalledTimes(1);
      expect(backupArchiver.discard).toHaveBeenCalledWith('/tmp/b.tar.gz');
      expect(backupRepository.create).toHaveBeenCalledTimes(1);
      expect(result.toPrimitive().sizeBytes).toBe(2048);
    });
  });

  describe('Error Scenarios', () => {
    it('still discards the temp file when the upload fails', async () => {
      const backupRepository = BackupRepositoryMother.create();
      const backupStorage = BackupStorageMother.create({
        upload: mock(async () => {
          throw new Error('upload failed');
        }),
      });
      const backupArchiver = BackupArchiverMother.create({
        pack: mock(async () => ({ path: '/tmp/b.tar.gz', sizeBytes: 1 })),
      });

      await expect(
        createBackup({
          backupRepository,
          backupStorage,
          backupArchiver,
          serverId: 'srv-1',
        }),
      ).rejects.toThrow('upload failed');
      expect(backupArchiver.discard).toHaveBeenCalledWith('/tmp/b.tar.gz');
      expect(backupRepository.create).not.toHaveBeenCalled();
    });
  });
});
