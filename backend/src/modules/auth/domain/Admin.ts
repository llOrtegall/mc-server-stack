import { Email } from './Email.js';
import { PasswordHash } from './PasswordHash.js';

export interface AdminPrimitives {
  id: string | null;
  email: string;
  passwordHash: string;
  createdAt: string | null;
}

export class Admin {
  private constructor(
    private readonly id: string | null,
    private readonly email: Email,
    private readonly passwordHash: PasswordHash,
    private readonly createdAt: string | null,
  ) {}

  static create(props: {
    id: string | null;
    email: Email;
    passwordHash: PasswordHash;
    createdAt?: string | null;
  }): Admin {
    return new Admin(
      props.id,
      props.email,
      props.passwordHash,
      props.createdAt ?? null,
    );
  }

  /** Builds a brand-new admin (no id/createdAt yet) from raw input. */
  static register(input: { email: string; passwordHash: string }): Admin {
    return Admin.create({
      id: null,
      email: Email.create(input.email),
      passwordHash: PasswordHash.create(input.passwordHash),
      createdAt: null,
    });
  }

  static fromPrimitive(data: AdminPrimitives): Admin {
    if (!data) throw new Error('Admin data must be provided');
    return Admin.create({
      id: data.id,
      email: Email.fromPrimitive(data.email),
      passwordHash: PasswordHash.fromPrimitive(data.passwordHash),
      createdAt: data.createdAt ?? null,
    });
  }

  getId(): string | null {
    return this.id;
  }

  getEmail(): string {
    return this.email.toPrimitive();
  }

  getPasswordHash(): string {
    return this.passwordHash.toPrimitive();
  }

  equals(other: Admin): boolean {
    return this.id !== null && this.id === other.id;
  }

  toPrimitive(): AdminPrimitives {
    return {
      id: this.id,
      email: this.email.toPrimitive(),
      passwordHash: this.passwordHash.toPrimitive(),
      createdAt: this.createdAt,
    };
  }

  /** Public API representation: never includes the password hash. */
  toPublic(): Omit<AdminPrimitives, 'passwordHash'> {
    const { passwordHash: _omit, ...rest } = this.toPrimitive();
    return rest;
  }
}
