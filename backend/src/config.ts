function requireEnv(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required env variable: ${key}`);
  return val;
}

export interface R2Config {
  endpoint: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
}

/** Remote backup storage is optional — enabled only when all R2 vars are set. */
function r2Config(): R2Config | null {
  const endpoint = process.env.R2_ENDPOINT;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET;
  if (endpoint && accessKeyId && secretAccessKey && bucket) {
    return { endpoint, accessKeyId, secretAccessKey, bucket };
  }
  return null;
}

export const config = {
  port: Number(process.env.PORT ?? 3000),
  databaseUrl: requireEnv('DATABASE_URL'),
  jwtSecret: requireEnv('JWT_SECRET'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  dockerSocket: process.env.DOCKER_SOCKET ?? '/var/run/docker.sock',
  mcDataPath: process.env.MC_DATA_PATH ?? '/data/mc-servers',
  backupLocalPath: process.env.BACKUP_LOCAL_PATH ?? '/data/mc-backups',
  r2: r2Config(),
};
