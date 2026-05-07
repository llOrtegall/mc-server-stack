import type { Admin } from '../domain/Admin.js';
import type { AdminRepository } from '../domain/AdminRepository.js';
import type { PasswordHasher } from '../domain/PasswordHasher.js';
import type { TokenRepository } from '../domain/TokenRepository.js';

interface LoginProps {
  adminRepository: AdminRepository;
  passwordHasher: PasswordHasher;
  tokenRepository: TokenRepository;
  email: string;
  password: string;
}

export async function login({
  adminRepository,
  passwordHasher,
  tokenRepository,
  email,
  password,
}: LoginProps): Promise<{ token: string; admin: Admin }> {
  const admin = await adminRepository.getByEmail(email);
  // Same error whether the email is unknown or the password is wrong, so the
  // response never reveals which admin emails exist.
  if (admin === null) throw new Error('[login] Invalid credentials');

  const valid = await passwordHasher.compare(password, admin.getPasswordHash());
  if (!valid) throw new Error('[login] Invalid credentials');

  const id = admin.getId();
  if (id === null) throw new Error('[login] Persisted admin is missing an id');

  return { token: tokenRepository.sign(id), admin };
}
