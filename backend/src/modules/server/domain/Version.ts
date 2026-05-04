export class Version {
  static readonly DEFAULT = '26.2';

  private constructor(private readonly value: string) {}

  static create(version?: string | null): Version {
    const value = version ?? Version.DEFAULT;
    Version.ensureIsValid(value);
    return new Version(value);
  }

  static fromPrimitive(version: unknown): Version {
    return Version.create(version as string);
  }

  static ensureIsValid(version: string): void {
    if (typeof version !== 'string' || version.trim() === '') {
      throw new Error('Version cannot be empty');
    }
    if (version.length > 20) {
      throw new Error('Version cannot exceed 20 characters');
    }
  }

  toPrimitive(): string {
    return this.value;
  }

  equals(other: Version): boolean {
    return this.value === other.value;
  }
}
