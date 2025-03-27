import type { Admin, LoginResponse } from '../types';
import { apiFetch } from './client';

export function login(email: string, password: string): Promise<LoginResponse> {
  return apiFetch<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function getMe(): Promise<Admin> {
  return apiFetch<Admin>('/api/auth/me');
}
