import { createReadStream, createWriteStream } from 'node:fs';
import { mkdir, rm, stat } from 'node:fs/promises';
import { join } from 'node:path';
import type { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { config } from '../config.js';
import { pool } from '../db/index.js';
import { AppError } from '../middleware/error.middleware.js';

const s3 = new S3Client({
  endpoint: config.r2.endpoint,
  region: 'auto',
  credentials: {
    accessKeyId: config.r2.accessKeyId,
    secretAccessKey: config.r2.secretAccessKey,
  },
  forcePathStyle: true,
});

interface Backup {
  id: string;
  server_id: string;
  s3_key: string;
  size_bytes: number | null;
  created_at: Date;
}

export async function listBackups(serverId: string): Promise<Backup[]> {
  const result = await pool.query<Backup>(
    'SELECT id, server_id, s3_key, size_bytes, created_at FROM backups WHERE server_id = $1 ORDER BY created_at DESC',
    [serverId],
  );
  return result.rows;
}

export async function createBackup(serverId: string): Promise<Backup> {
  const _serverPath = join(config.mcDataPath, serverId);
  const timestamp = Date.now();
  const tarName = `backup-${serverId}-${timestamp}.tar.gz`;
  const tarPath = join('/tmp', tarName);
  const s3Key = `${serverId}/${tarName}`;

  // tar the server data directory
  const tarProc = Bun.spawn(
    ['tar', '-czf', tarPath, '-C', config.mcDataPath, serverId],
    {
      stderr: 'pipe',
    },
  );
  await tarProc.exited;

  if (tarProc.exitCode !== 0) {
    throw new AppError(500, 'Failed to create tar archive');
  }

  const fileStat = await stat(tarPath);
  const fileStream = createReadStream(tarPath);

  await s3.send(
    new PutObjectCommand({
      Bucket: config.r2.bucket,
      Key: s3Key,
      Body: fileStream,
      ContentType: 'application/gzip',
      ContentLength: fileStat.size,
    }),
  );

  await rm(tarPath, { force: true });

  const result = await pool.query<Backup>(
    'INSERT INTO backups (server_id, s3_key, size_bytes) VALUES ($1, $2, $3) RETURNING id, server_id, s3_key, size_bytes, created_at',
    [serverId, s3Key, fileStat.size],
  );

  const backup = result.rows[0];
  if (!backup) throw new AppError(500, 'Failed to save backup record');
  return backup;
}

export async function deleteBackup(
  backupId: string,
  serverId: string,
): Promise<void> {
  const result = await pool.query<{ s3_key: string }>(
    'SELECT s3_key FROM backups WHERE id = $1 AND server_id = $2',
    [backupId, serverId],
  );
  const backup = result.rows[0];
  if (!backup) throw new AppError(404, 'Backup not found');

  await s3.send(
    new DeleteObjectCommand({ Bucket: config.r2.bucket, Key: backup.s3_key }),
  );
  await pool.query('DELETE FROM backups WHERE id = $1', [backupId]);
}

export async function restoreBackup(
  backupId: string,
  serverId: string,
): Promise<void> {
  const result = await pool.query<{ s3_key: string }>(
    'SELECT s3_key FROM backups WHERE id = $1 AND server_id = $2',
    [backupId, serverId],
  );
  const backup = result.rows[0];
  if (!backup) throw new AppError(404, 'Backup not found');

  const tarPath = join('/tmp', `restore-${backupId}.tar.gz`);
  const response = await s3.send(
    new GetObjectCommand({ Bucket: config.r2.bucket, Key: backup.s3_key }),
  );

  if (!response.Body) throw new AppError(500, 'Empty backup file');

  await pipeline(response.Body as Readable, createWriteStream(tarPath));

  const serverPath = join(config.mcDataPath, serverId);
  await rm(serverPath, { recursive: true, force: true });
  await mkdir(serverPath, { recursive: true });

  const extractProc = Bun.spawn(
    ['tar', '-xzf', tarPath, '--strip-components=1', '-C', serverPath],
    { stderr: 'pipe' },
  );
  await extractProc.exited;

  await rm(tarPath, { force: true });

  if (extractProc.exitCode !== 0) {
    throw new AppError(500, 'Failed to extract backup');
  }
}
