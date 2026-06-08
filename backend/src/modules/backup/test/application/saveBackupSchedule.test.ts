import { describe, expect, it, mock } from 'bun:test';
import { saveBackupSchedule } from '../../application/saveBackupSchedule.js';
import * as BackupScheduleRepositoryMother from '../helpers/BackupScheduleRepositoryMother.js';
import * as BackupStorageResolverMother from '../helpers/BackupStorageResolverMother.js';

describe('saveBackupSchedule (unit)', () => {
  describe('Basic Behaviour', () => {
    it('upserts the schedule when the location is available', async () => {
      const backupScheduleRepository = BackupScheduleRepositoryMother.create();
      const backupStorages = BackupStorageResolverMother.create();

      const result = await saveBackupSchedule({
        backupScheduleRepository,
        backupStorages,
        serverId: 'srv-1',
        enabled: true,
        frequency: 'daily',
        retention: 5,
        location: 'local',
      });

      expect(backupScheduleRepository.upsert).toHaveBeenCalledTimes(1);
      expect(result.getRetention()).toBe(5);
      expect(result.isEnabled()).toBe(true);
    });
  });

  describe('Error Scenarios', () => {
    it('rejects when the location is not available', async () => {
      const backupScheduleRepository = BackupScheduleRepositoryMother.create();
      const backupStorages = BackupStorageResolverMother.create(undefined, {
        isAvailable: mock(() => false),
      });

      await expect(
        saveBackupSchedule({
          backupScheduleRepository,
          backupStorages,
          serverId: 'srv-1',
          enabled: true,
          frequency: 'daily',
          retention: 5,
          location: 's3',
        }),
      ).rejects.toThrow('not available');
      expect(backupScheduleRepository.upsert).not.toHaveBeenCalled();
    });
  });
});
