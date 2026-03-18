import { DataTypes, Model, type Optional } from "sequelize";
import { sequelize } from "./db.js";

// ── Server Model ────────────────────────────────────────────────────────────

interface ServerAttributes {
  id: string;
  name: string;
  version: string;
  status: string;
  port: number;
  rconPort: number;
  rconPassword: string;
  memoryMb: number;
  maxPlayers: number;
  motd: string;
  difficulty: string;
  gamemode: string;
  onlineMode: boolean;
  containerId: string | null;
  dataPath: string;
  autoShutdownEnabled: boolean;
  lastPlayerLeftAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

type ServerCreation = Optional<ServerAttributes, "createdAt" | "updatedAt">;

export class ServerModel extends Model<ServerAttributes, ServerCreation>
  implements ServerAttributes {
  declare id: string;
  declare name: string;
  declare version: string;
  declare status: string;
  declare port: number;
  declare rconPort: number;
  declare rconPassword: string;
  declare memoryMb: number;
  declare maxPlayers: number;
  declare motd: string;
  declare difficulty: string;
  declare gamemode: string;
  declare onlineMode: boolean;
  declare containerId: string | null;
  declare dataPath: string;
  declare autoShutdownEnabled: boolean;
  declare lastPlayerLeftAt: Date | null;
  declare createdAt: Date;
  declare updatedAt: Date;
}

ServerModel.init(
  {
    id: { type: DataTypes.STRING, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    version: { type: DataTypes.STRING, allowNull: false },
    status: { type: DataTypes.STRING, allowNull: false, defaultValue: "stopped" },
    port: { type: DataTypes.INTEGER, allowNull: false, unique: true },
    rconPort: { type: DataTypes.INTEGER, allowNull: false, unique: true },
    rconPassword: { type: DataTypes.STRING, allowNull: false },
    memoryMb: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1024 },
    maxPlayers: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 20 },
    motd: { type: DataTypes.STRING, allowNull: false, defaultValue: "Un servidor Minecraft" },
    difficulty: { type: DataTypes.STRING, allowNull: false, defaultValue: "normal" },
    gamemode: { type: DataTypes.STRING, allowNull: false, defaultValue: "survival" },
    onlineMode: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    containerId: { type: DataTypes.STRING, allowNull: true },
    dataPath: { type: DataTypes.STRING, allowNull: false },
    autoShutdownEnabled: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    lastPlayerLeftAt: { type: DataTypes.DATE, allowNull: true },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: "servers",
    modelName: "Server",
  }
);

// ── Backup Model ────────────────────────────────────────────────────────────

interface BackupAttributes {
  id: string;
  serverId: string;
  filename: string;
  r2Key: string;
  sizeBytes: number;
  createdAt: Date;
}

type BackupCreation = Optional<BackupAttributes, "createdAt">;

export class BackupModel extends Model<BackupAttributes, BackupCreation>
  implements BackupAttributes {
  declare id: string;
  declare serverId: string;
  declare filename: string;
  declare r2Key: string;
  declare sizeBytes: number;
  declare createdAt: Date;
}

BackupModel.init(
  {
    id: { type: DataTypes.STRING, primaryKey: true },
    serverId: { type: DataTypes.STRING, allowNull: false },
    filename: { type: DataTypes.STRING, allowNull: false },
    r2Key: { type: DataTypes.STRING, allowNull: false },
    sizeBytes: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
    createdAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: "backups",
    modelName: "Backup",
    updatedAt: false, // Backups no se actualizan, solo se crean o eliminan
  }
);

// ── Metrics Snapshot Model ──────────────────────────────────────────────────

interface MetricsSnapshotAttributes {
  id: string;
  serverId: string;
  cpuPercent: number;
  memoryUsedMb: number;
  playerCount: number;
  recordedAt: Date;
}

type MetricsSnapshotCreation = Optional<MetricsSnapshotAttributes, "recordedAt">;

export class MetricsSnapshotModel extends Model<MetricsSnapshotAttributes, MetricsSnapshotCreation>
  implements MetricsSnapshotAttributes {
  declare id: string;
  declare serverId: string;
  declare cpuPercent: number;
  declare memoryUsedMb: number;
  declare playerCount: number;
  declare recordedAt: Date;
}

MetricsSnapshotModel.init(
  {
    id: { type: DataTypes.STRING, primaryKey: true },
    serverId: { type: DataTypes.STRING, allowNull: false },
    cpuPercent: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    memoryUsedMb: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    playerCount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    recordedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    tableName: "metrics_snapshots",
    modelName: "MetricsSnapshot",
    timestamps: false,
  }
);

// ── Relaciones ──────────────────────────────────────────────────────────────

ServerModel.hasMany(BackupModel, { foreignKey: "serverId", onDelete: "CASCADE" });
BackupModel.belongsTo(ServerModel, { foreignKey: "serverId" });

ServerModel.hasMany(MetricsSnapshotModel, { foreignKey: "serverId", onDelete: "CASCADE" });
MetricsSnapshotModel.belongsTo(ServerModel, { foreignKey: "serverId" });
