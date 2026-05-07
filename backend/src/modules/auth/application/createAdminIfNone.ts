import { Admin } from '../domain/Admin.js';
import type { AdminRepository } from '../domain/AdminRepository.js';
import type { PasswordHasher } from '../domain/PasswordHasher.js';

interface CreateAdminIfNoneProps {
  adminRepository: AdminRepository;
  passwordHasher: PasswordHasher;
  email: string;
  password: string;
}

/** Seeds the single admin on first boot, only when none exists yet. */
export async function createAdminIfNone({
  adminRepository,
  passwordHasher,
  email,
  password,
}: CreateAdminIfNoneProps): Promise<void> {
  const count = await adminRepository.count();
  if (count > 0) return;

  const passwordHash = await passwordHasher.hash(password);
  await adminRepository.create(Admin.register({ email, passwordHash }));
  console.log(`[auth] default admin created: ${email}`);
}
