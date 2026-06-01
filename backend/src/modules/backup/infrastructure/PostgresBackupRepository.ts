import { pool } from '../../../db/index.js';
import { Backup, type BackupPrimitives } from '../domain/Backup.js';
import { BackupList } from '../domain/BackupList.js';
import type { BackupRepository } from '../domain/BackupRepository.js';

const COLUMNS = `id,
  server_id AS "serverId",
  s3_key AS "storageKey",
  location,
  auto,
  size_bytes AS "sizeBytes",
  created_at AS "createdAt"`;

interface BackupRow extends Omit<BackupPrimitives, 'sizeBytes' | 'createdAt'> {
  sizeBytes: string | number | null;
  createdAt: Date | null;
}

function rowToBackup(row: BackupRow): Backup {
  return Backup.fromPrimitive({
    id: row.id,
    serverId: row.serverId,
    storageKey: row.storageKey,
    location: row.location,
    auto: row.auto,
    sizeBytes: row.sizeBytes === null ? null : Number(row.sizeBytes),
    createdAt: row.createdAt ? row.createdAt.toISOString() : null,
  });
}

export class PostgresBackupRepository implements BackupRepository {
  async create(backup: Backup): Promise<Backup> {
    const data = backup.toPrimitive();
    const result = await pool.query<BackupRow>(
      `INSERT INTO backups (server_id, s3_key, location, auto, size_bytes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING ${COLUMNS}`,
      [
        data.serverId,
        data.storageKey,
        data.location,
        data.auto,
        data.sizeBytes,
      ],
    );
    const row = result.rows[0];
    if (!row)
      throw new Error('[PostgresBackupRepository] Failed to create backup');
    return rowToBackup(row);
  }

  async listByServer(serverId: string): Promise<BackupList> {
    const result = await pool.query<BackupRow>(
      `SELECT ${COLUMNS} FROM backups WHERE server_id = $1 ORDER BY created_at DESC`,
      [serverId],
    );
    return BackupList.create(result.rows.map(rowToBackup));
  }

  async listAutoByServerAndLocation(
    serverId: string,
    location: string,
  ): Promise<BackupList> {
    const result = await pool.query<BackupRow>(
      `SELECT ${COLUMNS} FROM backups
       WHERE server_id = $1 AND location = $2 AND auto = true
       ORDER BY created_at DESC`,
      [serverId, location],
    );
    return BackupList.create(result.rows.map(rowToBackup));
  }

  async getByIdForServer(id: string, serverId: string): Promise<Backup | null> {
    const result = await pool.query<BackupRow>(
      `SELECT ${COLUMNS} FROM backups WHERE id = $1 AND server_id = $2`,
      [id, serverId],
    );
    const row = result.rows[0];
    return row ? rowToBackup(row) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await pool.query('DELETE FROM backups WHERE id = $1', [id]);
    return result.rowCount === 1;
  }
}
