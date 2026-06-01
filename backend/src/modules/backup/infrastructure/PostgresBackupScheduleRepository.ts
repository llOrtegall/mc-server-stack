import { pool } from '../../../db/index.js';
import {
  BackupSchedule,
  type BackupSchedulePrimitives,
} from '../domain/BackupSchedule.js';
import type { BackupScheduleRepository } from '../domain/BackupScheduleRepository.js';

const COLUMNS = `server_id AS "serverId",
  enabled,
  frequency,
  retention,
  location,
  last_run_at AS "lastRunAt"`;

interface ScheduleRow extends Omit<BackupSchedulePrimitives, 'lastRunAt'> {
  lastRunAt: Date | null;
}

function rowToSchedule(row: ScheduleRow): BackupSchedule {
  return BackupSchedule.fromPrimitive({
    serverId: row.serverId,
    enabled: row.enabled,
    frequency: row.frequency,
    retention: row.retention,
    location: row.location,
    lastRunAt: row.lastRunAt ? row.lastRunAt.toISOString() : null,
  });
}

export class PostgresBackupScheduleRepository
  implements BackupScheduleRepository
{
  async getByServer(serverId: string): Promise<BackupSchedule | null> {
    const result = await pool.query<ScheduleRow>(
      `SELECT ${COLUMNS} FROM backup_schedules WHERE server_id = $1`,
      [serverId],
    );
    const row = result.rows[0];
    return row ? rowToSchedule(row) : null;
  }

  async upsert(schedule: BackupSchedule): Promise<BackupSchedule> {
    const data = schedule.toPrimitive();
    const result = await pool.query<ScheduleRow>(
      `INSERT INTO backup_schedules
         (server_id, enabled, frequency, retention, location, last_run_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (server_id) DO UPDATE SET
         enabled = EXCLUDED.enabled,
         frequency = EXCLUDED.frequency,
         retention = EXCLUDED.retention,
         location = EXCLUDED.location,
         last_run_at = EXCLUDED.last_run_at
       RETURNING ${COLUMNS}`,
      [
        data.serverId,
        data.enabled,
        data.frequency,
        data.retention,
        data.location,
        data.lastRunAt,
      ],
    );
    const row = result.rows[0];
    if (!row)
      throw new Error('[PostgresBackupScheduleRepository] Failed to upsert');
    return rowToSchedule(row);
  }

  async listEnabled(): Promise<BackupSchedule[]> {
    const result = await pool.query<ScheduleRow>(
      `SELECT ${COLUMNS} FROM backup_schedules WHERE enabled = true`,
    );
    return result.rows.map(rowToSchedule);
  }
}
