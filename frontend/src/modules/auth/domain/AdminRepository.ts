import type { Admin } from './Admin.js';

export interface AuthSession {
  token: string;
  admin: Admin;
}

export interface AdminRepository {
  login: (email: string, password: string) => Promise<AuthSession>;
  getMe: () => Promise<Admin>;
}
