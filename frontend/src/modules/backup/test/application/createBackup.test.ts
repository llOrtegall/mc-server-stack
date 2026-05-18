import { createBackup } from '../../application/createBackup.js';
import * as BackupMother from '../helpers/BackupMother.js';
import * as BackupRepositoryMother from '../helpers/BackupRepositoryMother.js';

describe('createBackup (unit)', () => {
  describe('Basic Behaviour', () => {
    it('asks the repository to create a backup for the server', async () => {
      const backup = BackupMother.create({ serverId: 'srv-1' });
      const backupRepository = BackupRepositoryMother.create({
        create: vi.fn(async () => backup),
      });

      const result = await createBackup({
        backupRepository,
        serverId: 'srv-1',
      });

      expect(result).toBe(backup);
      expect(backupRepository.create).toHaveBeenCalledWith('srv-1');
    });
  });

  describe('Error Scenarios', () => {
    it('throws when no server id is provided', async () => {
      const backupRepository = BackupRepositoryMother.create();

      await expect(
        createBackup({ backupRepository, serverId: '' }),
      ).rejects.toThrow('Server id must be provided');
      expect(backupRepository.create).not.toHaveBeenCalled();
    });
  });
});
