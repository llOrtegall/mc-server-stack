CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS servers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  edition VARCHAR(20) NOT NULL DEFAULT 'java',
  version VARCHAR(20) NOT NULL DEFAULT '1.21.4',
  port INTEGER NOT NULL UNIQUE,
  rcon_port INTEGER NOT NULL UNIQUE,
  rcon_password VARCHAR(100) NOT NULL,
  container_id VARCHAR(255),
  status VARCHAR(20) NOT NULL DEFAULT 'stopped',
  ram_mb INTEGER NOT NULL DEFAULT 1024,
  cpu_limit FLOAT NOT NULL DEFAULT 1.0,
  properties JSONB NOT NULL DEFAULT '{}'::jsonb,
  show_coordinates BOOLEAN NOT NULL DEFAULT false,
  pvp BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Idempotent upgrade for servers tables created before the properties column existed.
ALTER TABLE servers
  ADD COLUMN IF NOT EXISTS properties JSONB NOT NULL DEFAULT '{}'::jsonb;

-- Idempotent upgrade for servers tables created before the edition column existed.
ALTER TABLE servers
  ADD COLUMN IF NOT EXISTS edition VARCHAR(20) NOT NULL DEFAULT 'java';

-- Bedrock gamerule toggles (show coordinates, pvp) applied via the in-container
-- send-command script. On Bedrock these are gamerules, not server.properties, so
-- they live in their own columns. Note `pvp` here is the Bedrock gamerule and is
-- distinct from the Java `server.properties` pvp held inside `properties`.
ALTER TABLE servers
  ADD COLUMN IF NOT EXISTS show_coordinates BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE servers
  ADD COLUMN IF NOT EXISTS pvp BOOLEAN NOT NULL DEFAULT true;

CREATE TABLE IF NOT EXISTS backups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id UUID NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
  s3_key VARCHAR(500) NOT NULL,
  location VARCHAR(20) NOT NULL DEFAULT 's3',
  auto BOOLEAN NOT NULL DEFAULT false,
  size_bytes BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Idempotent upgrade for backups tables created before location/auto existed.
ALTER TABLE backups
  ADD COLUMN IF NOT EXISTS location VARCHAR(20) NOT NULL DEFAULT 's3';
ALTER TABLE backups
  ADD COLUMN IF NOT EXISTS auto BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS backup_schedules (
  server_id UUID PRIMARY KEY REFERENCES servers(id) ON DELETE CASCADE,
  enabled BOOLEAN NOT NULL DEFAULT false,
  frequency VARCHAR(20) NOT NULL DEFAULT 'daily',
  retention INTEGER NOT NULL DEFAULT 7,
  location VARCHAR(20) NOT NULL DEFAULT 'local',
  last_run_at TIMESTAMPTZ
);
