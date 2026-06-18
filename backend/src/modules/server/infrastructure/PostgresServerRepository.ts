import { pool } from '../../../db/index.js';
import { Server, type ServerPrimitives } from '../domain/Server.js';
import { ServerList } from '../domain/ServerList.js';
import type { ServerRepository } from '../domain/ServerRepository.js';

const COLUMNS = `id,
  name,
  edition,
  version,
  port,
  rcon_port AS "rconPort",
  rcon_password AS "rconPassword",
  container_id AS "containerId",
  status,
  ram_mb AS "ramMb",
  cpu_limit AS "cpuLimit",
  properties,
  created_at AS "createdAt",
  updated_at AS "updatedAt"`;

interface ServerRow extends Omit<ServerPrimitives, 'createdAt' | 'updatedAt'> {
  createdAt: Date | null;
  updatedAt: Date | null;
}

function rowToServer(row: ServerRow): Server {
  return Server.fromPrimitive({
    ...row,
    createdAt: row.createdAt ? row.createdAt.toISOString() : null,
    updatedAt: row.updatedAt ? row.updatedAt.toISOString() : null,
  });
}

export class PostgresServerRepository implements ServerRepository {
  async create(server: Server): Promise<Server> {
    const data = server.toPrimitive();
    const result = await pool.query<ServerRow>(
      `INSERT INTO servers (name, edition, version, port, rcon_port, rcon_password, ram_mb, cpu_limit, status, properties)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING ${COLUMNS}`,
      [
        data.name,
        data.edition,
        data.version,
        data.port,
        data.rconPort,
        data.rconPassword,
        data.ramMb,
        data.cpuLimit,
        data.status,
        JSON.stringify(data.properties),
      ],
    );
    const row = result.rows[0];
    if (!row)
      throw new Error('[PostgresServerRepository] Failed to create server');
    return rowToServer(row);
  }

  async getById(id: string): Promise<Server | null> {
    const result = await pool.query<ServerRow>(
      `SELECT ${COLUMNS} FROM servers WHERE id = $1`,
      [id],
    );
    const row = result.rows[0];
    return row ? rowToServer(row) : null;
  }

  async getAll(): Promise<ServerList> {
    const result = await pool.query<ServerRow>(
      `SELECT ${COLUMNS} FROM servers ORDER BY created_at DESC`,
    );
    return ServerList.create(result.rows.map(rowToServer));
  }

  async update(server: Server): Promise<Server> {
    const data = server.toPrimitive();
    const result = await pool.query<ServerRow>(
      `UPDATE servers
       SET name = $1, edition = $2, version = $3, port = $4, rcon_port = $5, rcon_password = $6,
           container_id = $7, status = $8, ram_mb = $9, cpu_limit = $10,
           properties = $11, updated_at = NOW()
       WHERE id = $12
       RETURNING ${COLUMNS}`,
      [
        data.name,
        data.edition,
        data.version,
        data.port,
        data.rconPort,
        data.rconPassword,
        data.containerId,
        data.status,
        data.ramMb,
        data.cpuLimit,
        JSON.stringify(data.properties),
        data.id,
      ],
    );
    const row = result.rows[0];
    if (!row)
      throw new Error('[PostgresServerRepository] Server not found for update');
    return rowToServer(row);
  }

  async delete(id: string): Promise<boolean> {
    const result = await pool.query('DELETE FROM servers WHERE id = $1', [id]);
    return result.rowCount === 1;
  }
}
