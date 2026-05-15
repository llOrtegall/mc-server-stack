import { apiFetch } from '../../../api/client.js';
import { Admin, type AdminPrimitives } from '../domain/Admin.js';
import type {
  AdminRepository,
  AuthSession,
} from '../domain/AdminRepository.js';

interface LoginResponse {
  token: string;
  admin: AdminPrimitives;
}

export class HttpAdminRepository implements AdminRepository {
  async login(email: string, password: string): Promise<AuthSession> {
    const data = await apiFetch<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    return { token: data.token, admin: Admin.fromPrimitive(data.admin) };
  }

  async getMe(): Promise<Admin> {
    const data = await apiFetch<AdminPrimitives>('/api/auth/me');
    return Admin.fromPrimitive(data);
  }
}
