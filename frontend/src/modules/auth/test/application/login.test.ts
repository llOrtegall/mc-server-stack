import { login } from '../../application/login.js';
import * as AdminMother from '../helpers/AdminMother.js';
import * as AdminRepositoryMother from '../helpers/AdminRepositoryMother.js';

describe('login (unit)', () => {
  describe('Basic Behaviour', () => {
    it('delegates the credentials and returns the session', async () => {
      const admin = AdminMother.create();
      const adminRepository = AdminRepositoryMother.create({
        login: vi.fn(async () => ({ token: 'jwt-123', admin })),
      });

      const result = await login({
        adminRepository,
        email: 'admin@mc.local',
        password: 'secret',
      });

      expect(result.token).toBe('jwt-123');
      expect(result.admin).toBe(admin);
      expect(adminRepository.login).toHaveBeenCalledWith(
        'admin@mc.local',
        'secret',
      );
    });
  });

  describe('Error Scenarios', () => {
    it('throws when credentials are missing', async () => {
      const adminRepository = AdminRepositoryMother.create();

      await expect(
        login({ adminRepository, email: '', password: '' }),
      ).rejects.toThrow('Email and password must be provided');
      expect(adminRepository.login).not.toHaveBeenCalled();
    });
  });
});
