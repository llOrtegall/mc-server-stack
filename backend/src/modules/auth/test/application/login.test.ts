import { describe, expect, it, mock } from 'bun:test';
import { login } from '../../application/login.js';
import * as AdminMother from '../helpers/AdminMother.js';
import * as AdminRepositoryMother from '../helpers/AdminRepositoryMother.js';
import * as PasswordHasherMother from '../helpers/PasswordHasherMother.js';
import * as TokenRepositoryMother from '../helpers/TokenRepositoryMother.js';

describe('login (unit)', () => {
  describe('Basic Behaviour', () => {
    it('returns a token and the admin for valid credentials', async () => {
      const admin = AdminMother.create({ id: 'admin-1', email: 'a@b.com' });
      const adminRepository = AdminRepositoryMother.create({
        getByEmail: mock(async () => admin),
      });
      const passwordHasher = PasswordHasherMother.create({
        compare: mock(async () => true),
      });
      const tokenRepository = TokenRepositoryMother.create({
        sign: mock(() => 'jwt-token'),
      });

      const result = await login({
        adminRepository,
        passwordHasher,
        tokenRepository,
        email: 'a@b.com',
        password: 'secret123',
      });

      expect(result.token).toBe('jwt-token');
      expect(result.admin).toBe(admin);
      expect(tokenRepository.sign).toHaveBeenCalledWith('admin-1');
    });
  });

  describe('Error Scenarios', () => {
    it('rejects with a generic message when the email is unknown', async () => {
      const adminRepository = AdminRepositoryMother.create({
        getByEmail: mock(async () => null),
      });
      const passwordHasher = PasswordHasherMother.create();
      const tokenRepository = TokenRepositoryMother.create();

      await expect(
        login({
          adminRepository,
          passwordHasher,
          tokenRepository,
          email: 'missing@b.com',
          password: 'secret123',
        }),
      ).rejects.toThrow('Invalid credentials');
      expect(passwordHasher.compare).not.toHaveBeenCalled();
    });

    it('rejects with the same generic message when the password is wrong', async () => {
      const admin = AdminMother.create({ id: 'admin-1' });
      const adminRepository = AdminRepositoryMother.create({
        getByEmail: mock(async () => admin),
      });
      const passwordHasher = PasswordHasherMother.create({
        compare: mock(async () => false),
      });
      const tokenRepository = TokenRepositoryMother.create();

      await expect(
        login({
          adminRepository,
          passwordHasher,
          tokenRepository,
          email: 'a@b.com',
          password: 'wrong',
        }),
      ).rejects.toThrow('Invalid credentials');
      expect(tokenRepository.sign).not.toHaveBeenCalled();
    });
  });
});
