import type { BackupLocationValue } from './BackupLocation.js';

export const BACKUP_FREQUENCIES = [
  'hourly',
  'every6h',
  'daily',
  'weekly',
] as const;
export type BackupFrequencyValue = (typeof BACKUP_FREQUENCIES)[number];

export const FREQUENCY_LABELS: Record<BackupFrequencyValue, string> = {
  hourly: 'Cada hora',
  every6h: 'Cada 6 horas',
  daily: 'Diario',
  weekly: 'Semanal',
};

export interface BackupSchedulePrimitives {
  serverId: string;
  enabled: boolean;
  frequency: BackupFrequencyValue;
  retention: number;
  location: BackupLocationValue;
  lastRunAt: string | null;
}

export class BackupSchedule {
  private readonly serverId: string;
  private readonly enabled: boolean;
  private readonly frequency: BackupFrequencyValue;
  private readonly retention: number;
  private readonly location: BackupLocationValue;
  private readonly lastRunAt: string | null;

  private constructor(props: BackupSchedulePrimitives) {
    this.serverId = props.serverId;
    this.enabled = props.enabled;
    this.frequency = props.frequency;
    this.retention = props.retention;
    this.location = props.location;
    this.lastRunAt = props.lastRunAt;
  }

  static fromPrimitive(data: BackupSchedulePrimitives): BackupSchedule {
    if (!data) throw new Error('Backup schedule data must be provided');
    return new BackupSchedule(data);
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  getFrequency(): BackupFrequencyValue {
    return this.frequency;
  }

  getRetention(): number {
    return this.retention;
  }

  getLocation(): BackupLocationValue {
    return this.location;
  }

  getLastRunAt(): string | null {
    return this.lastRunAt;
  }

  toPrimitive(): BackupSchedulePrimitives {
    return {
      serverId: this.serverId,
      enabled: this.enabled,
      frequency: this.frequency,
      retention: this.retention,
      location: this.location,
      lastRunAt: this.lastRunAt,
    };
  }
}
