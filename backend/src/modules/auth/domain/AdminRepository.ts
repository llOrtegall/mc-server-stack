import type { Admin } from './Admin.js';

export interface AdminRepository {
  getByEmail: (email: string) => Promise<Admin | null>;
  getById: (id: string) => Promise<Admin | null>;
  create: (admin: Admin) => Promise<Admin>;
  count: () => Promise<number>;
}
