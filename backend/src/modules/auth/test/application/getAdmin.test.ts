import { describe, expect, it, mock } from 'bun:test';
import { getAdmin } from '../../application/getAdmin.js';
import * as AdminMother from '../helpers/AdminMother.js';
import * as AdminRepositoryMother from '../helpers/AdminRepositoryMother.js';

describe('getAdmin (unit)', () => {
  describe('Basic Behaviour', () => {
    it('returns the admin from the repository', async () => {
      const admin = AdminMother.create({ id: 'admin-1' });
      const adminRepository = AdminRepositoryMother.create({
        getById: mock(async () => admin),
      });

      const result = await getAdmin({ adminRepository, id: 'admin-1' });

      expect(result).toBe(admin);
      expect(adminRepository.getById).toHaveBeenCalledWith('admin-1');
    });
  });

  describe('Edge Cases', () => {
    it('rejects when no id is provided', async () => {
      const adminRepository = AdminRepositoryMother.create();

      await expect(getAdmin({ adminRepository, id: '' })).rejects.toThrow(
        'Id must be provided',
      );
      expect(adminRepository.getById).not.toHaveBeenCalled();
    });
  });

  describe('Error Scenarios', () => {
    it('throws not found when the admin does not exist', async () => {
      const adminRepository = AdminRepositoryMother.create({
        getById: mock(async () => null),
      });

      await expect(
        getAdmin({ adminRepository, id: 'missing' }),
      ).rejects.toThrow('not found');
    });
  });
});
