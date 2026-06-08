import { describe, expect, it, mock } from 'bun:test';
import { BackupScheduler } from '../../application/BackupScheduler.js';
import * as BackupArchiverMother from '../helpers/BackupArchiverMother.js';
import * as BackupRepositoryMother from '../helpers/BackupRepositoryMother.js';
import * as BackupScheduleMother from '../helpers/BackupScheduleMother.js';
import * as BackupScheduleRepositoryMother from '../helpers/BackupScheduleRepositoryMother.js';
import * as BackupStorageResolverMother from '../helpers/BackupStorageResolverMother.js';
import * as WorldFlusherMother from '../helpers/WorldFlusherMother.js';

function scheduler(
  overrides: Partial<{
    listEnabled: ReturnType<typeof mock>;
  }> = {},
) {
  const backupScheduleRepository = BackupScheduleRepositoryMother.create(
    overrides.listEnabled ? { listEnabled: overrides.listEnabled } : {},
  );
  const backupRepository = BackupRepositoryMother.create();
  const instance = new BackupScheduler({
    backupScheduleRepository,
    backupRepository,
    backupStorages: BackupStorageResolverMother.create(),
    backupArchiver: BackupArchiverMother.create(),
    worldFlusher: WorldFlusherMother.create(),
  });
  return { instance, backupScheduleRepository, backupRepository };
}

describe('BackupScheduler (unit)', () => {
  describe('Basic Behaviour', () => {
    it('runs a due schedule and records the run', async () => {
      const schedule = BackupScheduleMother.create({
        serverId: 'srv-1',
        enabled: true,
        lastRunAt: null,
        location: 'local',
      });
      const { instance, backupScheduleRepository, backupRepository } =
        scheduler({ listEnabled: mock(async () => [schedule]) });

      await instance.tick(Date.parse('2026-01-01T00:00:00Z'));

      expect(backupRepository.create).toHaveBeenCalledTimes(1);
      expect(backupScheduleRepository.upsert).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge Cases', () => {
    it('skips schedules that are not due', async () => {
      const now = Date.parse('2026-01-02T00:00:00Z');
      const lastRunAt = new Date(now - 60 * 60 * 1000).toISOString();
      const schedule = BackupScheduleMother.create({
        enabled: true,
        frequency: 'daily',
        lastRunAt,
      });
      const { instance, backupScheduleRepository, backupRepository } =
        scheduler({ listEnabled: mock(async () => [schedule]) });

      await instance.tick(now);

      expect(backupRepository.create).not.toHaveBeenCalled();
      expect(backupScheduleRepository.upsert).not.toHaveBeenCalled();
    });
  });
});
