import { describe, expect, it, mock } from 'bun:test';
import { createBackup } from '../../application/createBackup.js';
import * as BackupArchiverMother from '../helpers/BackupArchiverMother.js';
import * as BackupRepositoryMother from '../helpers/BackupRepositoryMother.js';
import * as BackupStorageMother from '../helpers/BackupStorageMother.js';
import * as BackupStorageResolverMother from '../helpers/BackupStorageResolverMother.js';
import * as WorldFlusherMother from '../helpers/WorldFlusherMother.js';

describe('createBackup (unit)', () => {
  describe('Basic Behaviour', () => {
    it('flushes, packs, uploads, discards and stores the record', async () => {
      const backupRepository = BackupRepositoryMother.create();
      const backupStorage = BackupStorageMother.create();
      const backupStorages = BackupStorageResolverMother.create(backupStorage);
      const worldFlusher = WorldFlusherMother.create();
      const backupArchiver = BackupArchiverMother.create({
        pack: mock(async () => ({ path: '/tmp/b.tar.gz', sizeBytes: 2048 })),
      });

      const result = await createBackup({
        backupRepository,
        backupStorages,
        backupArchiver,
        worldFlusher,
        serverId: 'srv-1',
        location: 'local',
      });

      expect(worldFlusher.flush).toHaveBeenCalledWith('srv-1');
      expect(worldFlusher.resume).toHaveBeenCalledWith('srv-1');
      expect(backupArchiver.pack).toHaveBeenCalledWith('srv-1');
      expect(backupStorage.upload).toHaveBeenCalledTimes(1);
      expect(backupArchiver.discard).toHaveBeenCalledWith('/tmp/b.tar.gz');
      expect(backupRepository.create).toHaveBeenCalledTimes(1);
      expect(result.toPrimitive().sizeBytes).toBe(2048);
      expect(result.getLocation()).toBe('local');
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
      const backupStorages = BackupStorageResolverMother.create(backupStorage);
      const worldFlusher = WorldFlusherMother.create();
      const backupArchiver = BackupArchiverMother.create({
        pack: mock(async () => ({ path: '/tmp/b.tar.gz', sizeBytes: 1 })),
      });

      await expect(
        createBackup({
          backupRepository,
          backupStorages,
          backupArchiver,
          worldFlusher,
          serverId: 'srv-1',
          location: 'local',
        }),
      ).rejects.toThrow('upload failed');
      expect(backupArchiver.discard).toHaveBeenCalledWith('/tmp/b.tar.gz');
      expect(worldFlusher.resume).toHaveBeenCalledWith('srv-1');
      expect(backupRepository.create).not.toHaveBeenCalled();
    });
  });
});
