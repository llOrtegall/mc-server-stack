import {
  BackupFrequency,
  type BackupFrequencyValue,
} from './BackupFrequency.js';
import { BackupLocation, type BackupLocationValue } from './BackupLocation.js';

export interface BackupSchedulePrimitives {
  serverId: string;
  enabled: boolean;
  frequency: BackupFrequencyValue;
  retention: number;
  location: BackupLocationValue;
  lastRunAt: string | null;
}

const MAX_RETENTION = 50;

export class BackupSchedule {
  private constructor(
    private readonly serverId: string,
    private readonly enabled: boolean,
    private readonly frequency: BackupFrequency,
    private readonly retention: number,
    private readonly location: BackupLocation,
    private readonly lastRunAt: string | null,
  ) {}

  static create(props: {
    serverId: string;
    enabled: boolean;
    frequency: BackupFrequency;
    retention: number;
    location: BackupLocation;
    lastRunAt?: string | null;
  }): BackupSchedule {
    BackupSchedule.ensureRetentionIsValid(props.retention);
    return new BackupSchedule(
      props.serverId,
      props.enabled,
      props.frequency,
      props.retention,
      props.location,
      props.lastRunAt ?? null,
    );
  }

  /** Disabled daily/7/local schedule used when a server has none configured. */
  static default(serverId: string): BackupSchedule {
    return BackupSchedule.create({
      serverId,
      enabled: false,
      frequency: BackupFrequency.create('daily'),
      retention: 7,
      location: BackupLocation.create('local'),
      lastRunAt: null,
    });
  }

  static fromPrimitive(data: BackupSchedulePrimitives): BackupSchedule {
    if (!data) throw new Error('Backup schedule data must be provided');
    return BackupSchedule.create({
      serverId: data.serverId,
      enabled: data.enabled,
      frequency: BackupFrequency.fromPrimitive(data.frequency),
      retention: data.retention,
      location: BackupLocation.fromPrimitive(data.location),
      lastRunAt: data.lastRunAt ?? null,
    });
  }

  static ensureRetentionIsValid(retention: number): void {
    if (
      !Number.isInteger(retention) ||
      retention < 1 ||
      retention > MAX_RETENTION
    ) {
      throw new Error(
        `Retention must be an integer between 1 and ${MAX_RETENTION}`,
      );
    }
  }

  getServerId(): string {
    return this.serverId;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  getRetention(): number {
    return this.retention;
  }

  getLocation(): BackupLocationValue {
    return this.location.toPrimitive();
  }

  /** True when the schedule is enabled and the next run is overdue. */
  isDue(now: number): boolean {
    if (!this.enabled) return false;
    if (this.lastRunAt === null) return true;
    return now - Date.parse(this.lastRunAt) >= this.frequency.intervalMs();
  }

  withLastRun(at: string): BackupSchedule {
    return BackupSchedule.create({
      serverId: this.serverId,
      enabled: this.enabled,
      frequency: this.frequency,
      retention: this.retention,
      location: this.location,
      lastRunAt: at,
    });
  }

  toPrimitive(): BackupSchedulePrimitives {
    return {
      serverId: this.serverId,
      enabled: this.enabled,
      frequency: this.frequency.toPrimitive(),
      retention: this.retention,
      location: this.location.toPrimitive(),
      lastRunAt: this.lastRunAt,
    };
  }
}
