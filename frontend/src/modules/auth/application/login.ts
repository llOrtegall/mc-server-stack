import type {
  AdminRepository,
  AuthSession,
} from '../domain/AdminRepository.js';

interface LoginProps {
  adminRepository: AdminRepository;
  email: string;
  password: string;
}

export async function login({
  adminRepository,
  email,
  password,
}: LoginProps): Promise<AuthSession> {
  if (!email || !password)
    throw new Error('[login] Email and password must be provided');
  return adminRepository.login(email, password);
}
