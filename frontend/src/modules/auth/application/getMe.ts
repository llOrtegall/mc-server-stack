import type { Admin } from '../domain/Admin.js';
import type { AdminRepository } from '../domain/AdminRepository.js';

interface GetMeProps {
  adminRepository: AdminRepository;
}

export function getMe({ adminRepository }: GetMeProps): Promise<Admin> {
  return adminRepository.getMe();
}
