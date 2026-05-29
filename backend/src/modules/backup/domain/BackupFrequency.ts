export const BACKUP_FREQUENCIES = [
  'hourly',
  'every6h',
  'daily',
  'weekly',
] as const;
export type BackupFrequencyValue = (typeof BACKUP_FREQUENCIES)[number];

const INTERVAL_MS: Record<BackupFrequencyValue, number> = {
  hourly: 60 * 60 * 1000,
  every6h: 6 * 60 * 60 * 1000,
  daily: 24 * 60 * 60 * 1000,
  weekly: 7 * 24 * 60 * 60 * 1000,
};

/** How often an automatic backup runs. */
export class BackupFrequency {
  private constructor(private readonly value: BackupFrequencyValue) {}

  static create(value: BackupFrequencyValue): BackupFrequency {
    BackupFrequency.ensureIsValid(value);
    return new BackupFrequency(value);
  }

  static fromPrimitive(value: unknown): BackupFrequency {
    return BackupFrequency.create(value as BackupFrequencyValue);
  }

  static ensureIsValid(value: string): asserts value is BackupFrequencyValue {
    if (!BACKUP_FREQUENCIES.includes(value as BackupFrequencyValue)) {
      throw new Error(
        `Invalid backup frequency "${value}". Allowed: ${BACKUP_FREQUENCIES.join(', ')}`,
      );
    }
  }

  intervalMs(): number {
    return INTERVAL_MS[this.value];
  }

  toPrimitive(): BackupFrequencyValue {
    return this.value;
  }

  equals(other: BackupFrequency): boolean {
    return this.value === other.value;
  }
}
