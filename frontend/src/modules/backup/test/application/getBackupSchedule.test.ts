import { getBackupSchedule } from '../../application/getBackupSchedule.js';
import * as BackupRepositoryMother from '../helpers/BackupRepositoryMother.js';
import * as BackupScheduleMother from '../helpers/BackupScheduleMother.js';

describe('getBackupSchedule (unit)', () => {
  describe('Basic Behaviour', () => {
    it('returns the schedule from the repository', async () => {
      const schedule = BackupScheduleMother.create();
      const backupRepository = BackupRepositoryMother.create({
        getSchedule: vi.fn(async () => schedule),
      });

      const result = await getBackupSchedule({
        backupRepository,
        serverId: 'srv-1',
      });

      expect(result).toBe(schedule);
      expect(backupRepository.getSchedule).toHaveBeenCalledWith('srv-1');
    });
  });
});
