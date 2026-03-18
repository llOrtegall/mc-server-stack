import { BackupModel } from "./schema.js";
import type { IBackupRepository } from "../../domain/backup/IBackupRepository.js";
import { Backup } from "../../domain/backup/Backup.entity.js";

export class BackupRepository implements IBackupRepository {
  async findByServerId(serverId: string): Promise<Backup[]> {
    const rows = await BackupModel.findAll({
      where: { serverId },
      order: [["createdAt", "DESC"]],
    });
    return rows.map((r) =>
      Backup.reconstitute({
        id: r.id,
        serverId: r.serverId,
        filename: r.filename,
        r2Key: r.r2Key,
        sizeBytes: Number(r.sizeBytes),
        createdAt: r.createdAt,
      })
    );
  }

  async findById(id: string): Promise<Backup | null> {
    const row = await BackupModel.findByPk(id);
    if (!row) return null;
    return Backup.reconstitute({
      id: row.id,
      serverId: row.serverId,
      filename: row.filename,
      r2Key: row.r2Key,
      sizeBytes: Number(row.sizeBytes),
      createdAt: row.createdAt,
    });
  }

  async save(backup: Backup): Promise<void> {
    await BackupModel.create({
      id: backup.id,
      serverId: backup.serverId,
      filename: backup.filename,
      r2Key: backup.r2Key,
      sizeBytes: backup.sizeBytes,
    });
  }

  async delete(id: string): Promise<void> {
    await BackupModel.destroy({ where: { id } });
  }
}
