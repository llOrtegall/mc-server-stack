export interface Admin {
  id: string;
  email: string;
  created_at: string;
}

export interface LoginResponse {
  token: string;
  admin: Admin;
}

export type ServerStatus =
  | 'stopped'
  | 'starting'
  | 'running'
  | 'stopping'
  | 'error';

export interface Server {
  id: string;
  name: string;
  version: string;
  port: number;
  rcon_port: number;
  container_id: string | null;
  status: ServerStatus;
  ram_mb: number;
  cpu_limit: number;
  created_at: string;
  updated_at: string;
}

export interface CreateServerInput {
  name: string;
  version?: string;
  port: number;
  ram_mb?: number;
  cpu_limit?: number;
}
