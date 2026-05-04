import { randomBytes } from 'node:crypto';

export class RconPassword {
  private constructor(private readonly value: string) {}

  static create(password: string): RconPassword {
    RconPassword.ensureIsValid(password);
    return new RconPassword(password);
  }

  static fromPrimitive(password: unknown): RconPassword {
    return RconPassword.create(password as string);
  }

  static generate(): RconPassword {
    return new RconPassword(randomBytes(16).toString('hex'));
  }

  static ensureIsValid(password: string): void {
    if (typeof password !== 'string' || password.trim() === '') {
      throw new Error('RCON password cannot be empty');
    }
    if (password.length > 100) {
      throw new Error('RCON password cannot exceed 100 characters');
    }
  }

  toPrimitive(): string {
    return this.value;
  }

  equals(other: RconPassword): boolean {
    return this.value === other.value;
  }
}
