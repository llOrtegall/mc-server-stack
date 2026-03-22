export type ServerStatus =
  | "stopped"
  | "starting"
  | "running"
  | "stopping"
  | "error";

export interface MCServer {
  id: string;
  name: string;
  version: string;
  status: ServerStatus;
  port: number;
  memoryMb: number;
  maxPlayers: number;
  motd: string;
  difficulty: string;
  gamemode: string;
  onlineMode: boolean;
  autoShutdownEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ServerMetrics {
  cpuPercent: number;
  memoryUsedMb: number;
  memoryLimitMb: number;
}

export interface Backup {
  id: string;
  serverId: string;
  filename: string;
  sizeBytes: number;
  createdAt: string;
}

export interface PlayerList {
  count: number;
  max: number;
  players: string[];
}

export interface FileEntry {
  name: string;
  type: "file" | "directory";
  path: string;
}
