import { Backup, type BackupPrimitives } from './Backup.js';

export class BackupList {
  private constructor(private readonly backups: Backup[]) {}

  static create(backups: Backup[] | null): BackupList {
    return new BackupList(backups ?? []);
  }

  static fromPrimitive(items: BackupPrimitives[] | null): BackupList {
    if (items === null) return BackupList.create(null);
    return BackupList.create(items.map((i) => Backup.fromPrimitive(i)));
  }

  count(): number {
    return this.backups.length;
  }

  toArray(): Backup[] {
    return [...this.backups];
  }

  toPrimitive(): BackupPrimitives[] {
    return this.backups.map((b) => b.toPrimitive());
  }
}
