const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class Email {
  private constructor(private readonly value: string) {}

  static create(email: string): Email {
    Email.ensureIsValid(email);
    return new Email(email);
  }

  static fromPrimitive(email: unknown): Email {
    return Email.create(email as string);
  }

  static ensureIsValid(email: string): void {
    if (typeof email !== 'string' || email.trim() === '') {
      throw new Error('Email cannot be empty');
    }
    if (!EMAIL_RE.test(email)) {
      throw new Error(`Invalid email: ${email}`);
    }
  }

  toPrimitive(): string {
    return this.value;
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }
}
