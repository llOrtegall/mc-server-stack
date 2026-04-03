function requireEnv(key: string): string {
  const val = process.env[key]
  if (!val) throw new Error(`Missing required env variable: ${key}`)
  return val
}

export const config = {
  port: Number(process.env['PORT'] ?? 3000),
  databaseUrl: requireEnv('DATABASE_URL'),
  jwtSecret: requireEnv('JWT_SECRET'),
  jwtExpiresIn: process.env['JWT_EXPIRES_IN'] ?? '7d',
  dockerSocket: process.env['DOCKER_SOCKET'] ?? '/var/run/docker.sock',
  mcDataPath: process.env['MC_DATA_PATH'] ?? '/data/mc-servers',
  r2: {
    endpoint: requireEnv('R2_ENDPOINT'),
    accessKeyId: requireEnv('R2_ACCESS_KEY_ID'),
    secretAccessKey: requireEnv('R2_SECRET_ACCESS_KEY'),
    bucket: requireEnv('R2_BUCKET'),
  },
}
