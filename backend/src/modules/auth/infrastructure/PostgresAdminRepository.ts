import { pool } from '../../../db/index.js';
import { Admin, type AdminPrimitives } from '../domain/Admin.js';
import type { AdminRepository } from '../domain/AdminRepository.js';

const COLUMNS = `id,
  email,
  password_hash AS "passwordHash",
  created_at AS "createdAt"`;

interface AdminRow extends Omit<AdminPrimitives, 'createdAt'> {
  createdAt: Date | null;
}

function rowToAdmin(row: AdminRow): Admin {
  return Admin.fromPrimitive({
    ...row,
    createdAt: row.createdAt ? row.createdAt.toISOString() : null,
  });
}

export class PostgresAdminRepository implements AdminRepository {
  async getByEmail(email: string): Promise<Admin | null> {
    const result = await pool.query<AdminRow>(
      `SELECT ${COLUMNS} FROM admins WHERE email = $1`,
      [email],
    );
    const row = result.rows[0];
    return row ? rowToAdmin(row) : null;
  }

  async getById(id: string): Promise<Admin | null> {
    const result = await pool.query<AdminRow>(
      `SELECT ${COLUMNS} FROM admins WHERE id = $1`,
      [id],
    );
    const row = result.rows[0];
    return row ? rowToAdmin(row) : null;
  }

  async create(admin: Admin): Promise<Admin> {
    const data = admin.toPrimitive();
    const result = await pool.query<AdminRow>(
      `INSERT INTO admins (email, password_hash)
       VALUES ($1, $2)
       RETURNING ${COLUMNS}`,
      [data.email, data.passwordHash],
    );
    const row = result.rows[0];
    if (!row)
      throw new Error('[PostgresAdminRepository] Failed to create admin');
    return rowToAdmin(row);
  }

  async count(): Promise<number> {
    const result = await pool.query<{ count: string }>(
      'SELECT COUNT(*) AS count FROM admins',
    );
    return Number(result.rows[0]?.count ?? 0);
  }
}
