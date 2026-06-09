import type { BackupLocationValue } from './BackupLocation.js';

export interface BackupPrimitives {
  id: string;
  serverId: string;
  storageKey: string;
  location: BackupLocationValue;
  auto: boolean;
  sizeBytes: number | null;
  createdAt: string | null;
}

export class Backup {
  private readonly id: string;
  private readonly serverId: string;
  private readonly storageKey: string;
  private readonly location: BackupLocationValue;
  private readonly auto: boolean;
  private readonly sizeBytes: number | null;
  private readonly createdAt: string | null;

  private constructor(props: BackupPrimitives) {
    this.id = props.id;
    this.serverId = props.serverId;
    this.storageKey = props.storageKey;
    this.location = props.location;
    this.auto = props.auto;
    this.sizeBytes = props.sizeBytes;
    this.createdAt = props.createdAt;
  }

  static fromPrimitive(data: BackupPrimitives): Backup {
    if (!data) throw new Error('Backup data must be provided');
    return new Backup({
      ...data,
      location: data.location ?? 'local',
      auto: data.auto ?? false,
    });
  }

  getId(): string {
    return this.id;
  }

  getServerId(): string {
    return this.serverId;
  }

  getStorageKey(): string {
    return this.storageKey;
  }

  getLocation(): BackupLocationValue {
    return this.location;
  }

  isAuto(): boolean {
    return this.auto;
  }

  getSizeBytes(): number | null {
    return this.sizeBytes;
  }

  getCreatedAt(): string | null {
    return this.createdAt;
  }

  toPrimitive(): BackupPrimitives {
    return {
      id: this.id,
      serverId: this.serverId,
      storageKey: this.storageKey,
      location: this.location,
      auto: this.auto,
      sizeBytes: this.sizeBytes,
      createdAt: this.createdAt,
    };
  }
}
