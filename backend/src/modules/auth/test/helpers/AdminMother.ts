import { faker } from '@faker-js/faker';
import { Admin } from '../../domain/Admin.js';
import { Email } from '../../domain/Email.js';
import { PasswordHash } from '../../domain/PasswordHash.js';

interface AdminOverrides {
  id?: string | null;
  email?: string;
  passwordHash?: string;
}

export function create(overrides: AdminOverrides = {}): Admin {
  return Admin.create({
    id: overrides.id === undefined ? faker.string.uuid() : overrides.id,
    email: Email.create(overrides.email ?? faker.internet.email()),
    passwordHash: PasswordHash.create(
      overrides.passwordHash ?? faker.string.alphanumeric(60),
    ),
  });
}
