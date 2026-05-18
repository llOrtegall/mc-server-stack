import { restoreBackup } from '../../application/restoreBackup.js';
import * as BackupRepositoryMother from '../helpers/BackupRepositoryMother.js';

describe('restoreBackup (unit)', () => {
  describe('Basic Behaviour', () => {
    it('delegates the restore to the repository', async () => {
      const backupRepository = BackupRepositoryMother.create();

      await restoreBackup({
        backupRepository,
        serverId: 'srv-1',
        backupId: 'bkp-9',
      });

      expect(backupRepository.restore).toHaveBeenCalledWith('srv-1', 'bkp-9');
    });
  });
});
