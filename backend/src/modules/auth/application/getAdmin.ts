import type { Admin } from '../domain/Admin.js';
import type { AdminRepository } from '../domain/AdminRepository.js';

interface GetAdminProps {
  adminRepository: AdminRepository;
  id: string;
}

export async function getAdmin({
  adminRepository,
  id,
}: GetAdminProps): Promise<Admin> {
  if (!id) throw new Error('[getAdmin] Id must be provided');

  const admin = await adminRepository.getById(id);
  if (admin === null)
    throw new Error(`[getAdmin] Admin with id ${id} not found`);
  return admin;
}
