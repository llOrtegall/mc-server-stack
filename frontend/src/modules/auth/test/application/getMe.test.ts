import { getMe } from '../../application/getMe.js';
import * as AdminMother from '../helpers/AdminMother.js';
import * as AdminRepositoryMother from '../helpers/AdminRepositoryMother.js';

describe('getMe (unit)', () => {
  describe('Basic Behaviour', () => {
    it('returns the current admin from the repository', async () => {
      const admin = AdminMother.create();
      const adminRepository = AdminRepositoryMother.create({
        getMe: vi.fn(async () => admin),
      });

      const result = await getMe({ adminRepository });

      expect(result).toBe(admin);
      expect(adminRepository.getMe).toHaveBeenCalledTimes(1);
    });
  });
});
