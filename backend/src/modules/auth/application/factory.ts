import { BcryptPasswordHasher } from '../infrastructure/BcryptPasswordHasher.js';
import { JwtTokenRepository } from '../infrastructure/JwtTokenRepository.js';
import { PostgresAdminRepository } from '../infrastructure/PostgresAdminRepository.js';
import { createAdminIfNone } from './createAdminIfNone.js';
import { getAdmin } from './getAdmin.js';
import { login } from './login.js';

const adminRepository = new PostgresAdminRepository();
const passwordHasher = new BcryptPasswordHasher();
const tokenRepository = new JwtTokenRepository();

export const authFactory = {
  login: (email: string, password: string) =>
    login({
      adminRepository,
      passwordHasher,
      tokenRepository,
      email,
      password,
    }),

  getAdmin: (id: string) => getAdmin({ adminRepository, id }),

  createAdminIfNone: (email: string, password: string) =>
    createAdminIfNone({ adminRepository, passwordHasher, email, password }),
};
