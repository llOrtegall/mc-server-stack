import { randomUUID } from "crypto";

export interface BackupProps {
  id: string;
  serverId: string;
  filename: string;
  r2Key: string;
  sizeBytes: number;
  createdAt: Date;
}

export class Backup {
  private constructor(private readonly props: BackupProps) {}

  static create(input: Omit<BackupProps, "id" | "createdAt">): Backup {
    return new Backup({
      ...input,
      id: randomUUID(),
      createdAt: new Date(),
    });
  }

  static reconstitute(props: BackupProps): Backup {
    return new Backup(props);
  }

  get id(): string {
    return this.props.id;
  }
  get serverId(): string {
    return this.props.serverId;
  }
  get filename(): string {
    return this.props.filename;
  }
  get r2Key(): string {
    return this.props.r2Key;
  }
  get sizeBytes(): number {
    return this.props.sizeBytes;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }

  toJSON(): BackupProps {
    return { ...this.props };
  }
}
