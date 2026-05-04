export class ServerName {
  private constructor(private readonly value: string) {}

  static create(name: string): ServerName {
    ServerName.ensureIsValid(name);
    return new ServerName(name);
  }

  static fromPrimitive(name: unknown): ServerName {
    return ServerName.create(name as string);
  }

  static ensureIsValid(name: string): void {
    if (typeof name !== 'string' || name.trim() === '') {
      throw new Error('Server name cannot be empty');
    }
    if (name.length > 100) {
      throw new Error('Server name cannot exceed 100 characters');
    }
  }

  toPrimitive(): string {
    return this.value;
  }

  equals(other: ServerName): boolean {
    return this.value === other.value;
  }
}
