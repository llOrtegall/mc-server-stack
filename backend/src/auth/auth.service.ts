import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { pool } from '../db/index.js';
import { AppError } from '../middleware/error.middleware.js';

interface Admin {
  id: string;
  email: string;
  created_at: Date;
}

export async function login(
  email: string,
  password: string,
): Promise<{ token: string; admin: Admin }> {
  const result = await pool.query<Admin & { password_hash: string }>(
    'SELECT id, email, password_hash, created_at FROM admins WHERE email = $1',
    [email],
  );

  const admin = result.rows[0];
  if (!admin) throw new AppError(401, 'Invalid credentials');

  const valid = await bcrypt.compare(password, admin.password_hash);
  if (!valid) throw new AppError(401, 'Invalid credentials');

  const token = jwt.sign({ id: admin.id }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn as jwt.SignOptions['expiresIn'],
  });

  return {
    token,
    admin: { id: admin.id, email: admin.email, created_at: admin.created_at },
  };
}

export async function getAdmin(id: string): Promise<Admin> {
  const result = await pool.query<Admin>(
    'SELECT id, email, created_at FROM admins WHERE id = $1',
    [id],
  );
  const admin = result.rows[0];
  if (!admin) throw new AppError(404, 'Admin not found');
  return admin;
}

export async function createAdminIfNone(
  email: string,
  password: string,
): Promise<void> {
  const count = await pool.query<{ count: string }>(
    'SELECT COUNT(*) FROM admins',
  );
  if (Number(count.rows[0]?.count ?? 0) > 0) return;

  const hash = await bcrypt.hash(password, 10);
  await pool.query(
    'INSERT INTO admins (email, password_hash) VALUES ($1, $2)',
    [email, hash],
  );
  console.log(`[auth] default admin created: ${email}`);
}
