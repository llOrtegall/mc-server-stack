import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import pg from 'pg';
import { config } from '../config.js';

const { Pool } = pg;

export const pool = new Pool({ connectionString: config.databaseUrl });

export async function migrate() {
  const sql = readFileSync(
    join(import.meta.dir, 'migrations', '001_initial.sql'),
    'utf8',
  );
  await pool.query(sql);
  console.log('[db] migrations applied');
}
