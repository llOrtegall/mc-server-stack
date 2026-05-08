import { describe, expect, it, mock } from 'bun:test';
import { createAdminIfNone } from '../../application/createAdminIfNone.js';
import * as AdminRepositoryMother from '../helpers/AdminRepositoryMother.js';
import * as PasswordHasherMother from '../helpers/PasswordHasherMother.js';

describe('createAdminIfNone (unit)', () => {
  describe('Basic Behaviour', () => {
    it('hashes the password and creates the admin when none exists', async () => {
      const adminRepository = AdminRepositoryMother.create({
        count: mock(async () => 0),
      });
      const passwordHasher = PasswordHasherMother.create({
        hash: mock(async () => 'bcrypt-hash'),
      });

      await createAdminIfNone({
        adminRepository,
        passwordHasher,
        email: 'admin@b.com',
        password: 'secret123',
      });

      expect(passwordHasher.hash).toHaveBeenCalledWith('secret123');
      expect(adminRepository.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge Cases', () => {
    it('does nothing when an admin already exists', async () => {
      const adminRepository = AdminRepositoryMother.create({
        count: mock(async () => 1),
      });
      const passwordHasher = PasswordHasherMother.create();

      await createAdminIfNone({
        adminRepository,
        passwordHasher,
        email: 'admin@b.com',
        password: 'secret123',
      });

      expect(passwordHasher.hash).not.toHaveBeenCalled();
      expect(adminRepository.create).not.toHaveBeenCalled();
    });
  });
});
