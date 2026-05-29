export const BACKUP_LOCATIONS = ['local', 's3'] as const;
export type BackupLocationValue = (typeof BACKUP_LOCATIONS)[number];

/** Where a backup archive lives: the local volume or remote object storage. */
export class BackupLocation {
  private constructor(private readonly value: BackupLocationValue) {}

  static create(value: BackupLocationValue): BackupLocation {
    BackupLocation.ensureIsValid(value);
    return new BackupLocation(value);
  }

  static fromPrimitive(value: unknown): BackupLocation {
    return BackupLocation.create(value as BackupLocationValue);
  }

  static ensureIsValid(value: string): asserts value is BackupLocationValue {
    if (!BACKUP_LOCATIONS.includes(value as BackupLocationValue)) {
      throw new Error(
        `Invalid backup location "${value}". Allowed: ${BACKUP_LOCATIONS.join(', ')}`,
      );
    }
  }

  toPrimitive(): BackupLocationValue {
    return this.value;
  }

  equals(other: BackupLocation): boolean {
    return this.value === other.value;
  }
}
