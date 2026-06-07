import { describe, expect, it, mock } from 'bun:test';
import { getBackupSchedule } from '../../application/getBackupSchedule.js';
import * as BackupScheduleMother from '../helpers/BackupScheduleMother.js';
import * as BackupScheduleRepositoryMother from '../helpers/BackupScheduleRepositoryMother.js';

describe('getBackupSchedule (unit)', () => {
  describe('Basic Behaviour', () => {
    it('returns the stored schedule', async () => {
      const schedule = BackupScheduleMother.create({
        serverId: 'srv-1',
        enabled: true,
      });
      const backupScheduleRepository = BackupScheduleRepositoryMother.create({
        getByServer: mock(async () => schedule),
      });

      const result = await getBackupSchedule({
        backupScheduleRepository,
        serverId: 'srv-1',
      });

      expect(result).toBe(schedule);
    });
  });

  describe('Edge Cases', () => {
    it('returns a disabled default when none exists', async () => {
      const backupScheduleRepository = BackupScheduleRepositoryMother.create();

      const result = await getBackupSchedule({
        backupScheduleRepository,
        serverId: 'srv-1',
      });

      expect(result.isEnabled()).toBe(false);
      expect(result.getServerId()).toBe('srv-1');
    });
  });
});
