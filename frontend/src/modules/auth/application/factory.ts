import { HttpAdminRepository } from '../infrastructure/HttpAdminRepository.js';
import { getMe } from './getMe.js';
import { login } from './login.js';

const adminRepository = new HttpAdminRepository();

export const authFactory = {
  login: (email: string, password: string) =>
    login({ adminRepository, email, password }),
  getMe: () => getMe({ adminRepository }),
};
