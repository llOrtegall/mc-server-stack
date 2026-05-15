export interface BackupPrimitives {
  id: string;
  serverId: string;
  storageKey: string;
  sizeBytes: number | null;
  createdAt: string | null;
}

export class Backup {
  private readonly id: string;
  private readonly serverId: string;
  private readonly storageKey: string;
  private readonly sizeBytes: number | null;
  private readonly createdAt: string | null;

  private constructor(props: BackupPrimitives) {
    this.id = props.id;
    this.serverId = props.serverId;
    this.storageKey = props.storageKey;
    this.sizeBytes = props.sizeBytes;
    this.createdAt = props.createdAt;
  }

  static fromPrimitive(data: BackupPrimitives): Backup {
    if (!data) throw new Error('Backup data must be provided');
    return new Backup(data);
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
      sizeBytes: this.sizeBytes,
      createdAt: this.createdAt,
    };
  }
}
