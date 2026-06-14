import { saveBackupSchedule } from '../../application/saveBackupSchedule.js';
import * as BackupRepositoryMother from '../helpers/BackupRepositoryMother.js';
import * as BackupScheduleMother from '../helpers/BackupScheduleMother.js';

describe('saveBackupSchedule (unit)', () => {
  describe('Basic Behaviour', () => {
    it('delegates the schedule input to the repository', async () => {
      const saved = BackupScheduleMother.create({
        enabled: true,
        retention: 5,
      });
      const backupRepository = BackupRepositoryMother.create({
        saveSchedule: vi.fn(async () => saved),
      });
      const input = {
        enabled: true,
        frequency: 'daily' as const,
        retention: 5,
        location: 'local' as const,
      };

      const result = await saveBackupSchedule({
        backupRepository,
        serverId: 'srv-1',
        input,
      });

      expect(result).toBe(saved);
      expect(backupRepository.saveSchedule).toHaveBeenCalledWith(
        'srv-1',
        input,
      );
    });
  });
});
