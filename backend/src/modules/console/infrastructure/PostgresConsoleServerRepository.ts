import { pool } from '../../../db/index.js';
import type { ConsoleServer } from '../domain/ConsoleServer.js';
import type { ConsoleServerRepository } from '../domain/ConsoleServerRepository.js';

export class PostgresConsoleServerRepository
  implements ConsoleServerRepository
{
  async findById(serverId: string): Promise<ConsoleServer | null> {
    const result = await pool.query<ConsoleServer>(
      `SELECT container_id AS "containerId",
              edition,
              rcon_port AS "rconPort",
              rcon_password AS "rconPassword",
              status
       FROM servers
       WHERE id = $1`,
      [serverId],
    );
    return result.rows[0] ?? null;
  }
}
