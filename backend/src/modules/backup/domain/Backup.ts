import { StorageKey } from './StorageKey.js';

export interface BackupPrimitives {
  id: string | null;
  serverId: string;
  storageKey: string;
  sizeBytes: number | null;
  createdAt: string | null;
}

export class Backup {
  private constructor(
    private readonly id: string | null,
    private readonly serverId: string,
    private readonly storageKey: StorageKey,
    private readonly sizeBytes: number | null,
    private readonly createdAt: string | null,
  ) {}

  static create(props: {
    id: string | null;
    serverId: string;
    storageKey: StorageKey;
    sizeBytes: number | null;
    createdAt?: string | null;
  }): Backup {
    return new Backup(
      props.id,
      props.serverId,
      props.storageKey,
      props.sizeBytes,
      props.createdAt ?? null,
    );
  }

  /** Builds a brand-new backup record (no id/createdAt yet). */
  static register(input: {
    serverId: string;
    storageKey: string;
    sizeBytes: number | null;
  }): Backup {
    return Backup.create({
      id: null,
      serverId: input.serverId,
      storageKey: StorageKey.create(input.storageKey),
      sizeBytes: input.sizeBytes,
      createdAt: null,
    });
  }

  static fromPrimitive(data: BackupPrimitives): Backup {
    if (!data) throw new Error('Backup data must be provided');
    return Backup.create({
      id: data.id,
      serverId: data.serverId,
      storageKey: StorageKey.fromPrimitive(data.storageKey),
      sizeBytes: data.sizeBytes,
      createdAt: data.createdAt ?? null,
    });
  }

  getId(): string | null {
    return this.id;
  }

  getStorageKey(): string {
    return this.storageKey.toPrimitive();
  }

  equals(other: Backup): boolean {
    return this.id !== null && this.id === other.id;
  }

  toPrimitive(): BackupPrimitives {
    return {
      id: this.id,
      serverId: this.serverId,
      storageKey: this.storageKey.toPrimitive(),
      sizeBytes: this.sizeBytes,
      createdAt: this.createdAt,
    };
  }
}
