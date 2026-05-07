/**
 * A securely hashed password (e.g. bcrypt). The domain only ever stores the
 * hash; the plaintext password never becomes a value object and never leaves
 * the request handler.
 */
export class PasswordHash {
  private constructor(private readonly value: string) {}

  static create(hash: string): PasswordHash {
    PasswordHash.ensureIsValid(hash);
    return new PasswordHash(hash);
  }

  static fromPrimitive(hash: unknown): PasswordHash {
    return PasswordHash.create(hash as string);
  }

  static ensureIsValid(hash: string): void {
    if (typeof hash !== 'string' || hash.trim() === '') {
      throw new Error('Password hash cannot be empty');
    }
  }

  toPrimitive(): string {
    return this.value;
  }

  equals(other: PasswordHash): boolean {
    return this.value === other.value;
  }
}
