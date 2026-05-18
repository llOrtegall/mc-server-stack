import { faker } from '@faker-js/faker';
import { Admin, type AdminPrimitives } from '../../domain/Admin.js';

export function create(overrides: Partial<AdminPrimitives> = {}): Admin {
  return Admin.fromPrimitive({
    id: faker.string.uuid(),
    email: faker.internet.email(),
    createdAt: faker.date.past().toISOString(),
    ...overrides,
  });
}
