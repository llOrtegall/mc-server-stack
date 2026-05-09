/** Object-storage key under which a backup archive is stored (e.g. R2/S3). */
export class StorageKey {
  private constructor(private readonly value: string) {}

  static create(key: string): StorageKey {
    StorageKey.ensureIsValid(key);
    return new StorageKey(key);
  }

  static fromPrimitive(key: unknown): StorageKey {
    return StorageKey.create(key as string);
  }

  /** Builds the canonical key for a server's backup archive. */
  static forServerBackup(serverId: string, timestamp: number): StorageKey {
    return StorageKey.create(
      `${serverId}/backup-${serverId}-${timestamp}.tar.gz`,
    );
  }

  static ensureIsValid(key: string): void {
    if (typeof key !== 'string' || key.trim() === '') {
      throw new Error('Storage key cannot be empty');
    }
    if (key.length > 500) {
      throw new Error('Storage key cannot exceed 500 characters');
    }
  }

  toPrimitive(): string {
    return this.value;
  }

  equals(other: StorageKey): boolean {
    return this.value === other.value;
  }
}
