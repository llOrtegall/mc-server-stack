import { randomUUID } from "node:crypto";

export type ServerStatus =
  | "stopped"
  | "starting"
  | "running"
  | "stopping"
  | "error";

export type MinecraftVersion = '26.1' | '1.21.11' | '1.21.10' | '1.21.9';

export interface ServerProps {
  id: string;
  name: string;
  version: MinecraftVersion;
  status: ServerStatus;
  port: number;
  rconPort: number;
  rconPassword: string;
  memoryMb: number;
  maxPlayers: number;
  motd: string;
  difficulty: "peaceful" | "easy" | "normal" | "hard";
  gamemode: "survival" | "creative" | "adventure" | "spectator";
  onlineMode: boolean;
  containerId: string | null;
  dataPath: string;
  autoShutdownEnabled: boolean;
  lastPlayerLeftAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateServerInput {
  name: string;
  version: MinecraftVersion;
  port: number;
  memoryMb?: number;
  maxPlayers?: number;
  motd?: string;
  difficulty?: ServerProps["difficulty"];
  gamemode?: ServerProps["gamemode"];
  onlineMode?: boolean;
  autoShutdownEnabled?: boolean;
  dataBasePath?: string;
}

export class Server {
  private constructor(private readonly props: ServerProps) {}

  static create(input: CreateServerInput): Server {
    const id = randomUUID();
    return new Server({
      id,
      name: input.name,
      version: input.version,
      status: "stopped",
      port: input.port,
      rconPort: input.port + 10000, // RCON en puerto derivado (ej: 25565 → 35565)
      rconPassword: randomUUID().replace(/-/g, ""), // Password RCON aleatoria
      memoryMb: input.memoryMb ?? 1024,
      maxPlayers: input.maxPlayers ?? 20,
      motd: input.motd ?? "Un servidor Minecraft",
      difficulty: input.difficulty ?? "normal",
      gamemode: input.gamemode ?? "survival",
      onlineMode: input.onlineMode ?? true,
      containerId: null,
      dataPath: `${input.dataBasePath ?? "/data/servers"}/${id}`,
      autoShutdownEnabled: input.autoShutdownEnabled ?? true,
      lastPlayerLeftAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static reconstitute(props: ServerProps): Server {
    return new Server(props);
  }

  get id(): string {
    return this.props.id;
  }
  get name(): string {
    return this.props.name;
  }
  get version(): MinecraftVersion {
    return this.props.version;
  }
  get status(): ServerStatus {
    return this.props.status;
  }
  get port(): number {
    return this.props.port;
  }
  get rconPort(): number {
    return this.props.rconPort;
  }
  get rconPassword(): string {
    return this.props.rconPassword;
  }
  get memoryMb(): number {
    return this.props.memoryMb;
  }
  get maxPlayers(): number {
    return this.props.maxPlayers;
  }
  get motd(): string {
    return this.props.motd;
  }
  get difficulty(): ServerProps["difficulty"] {
    return this.props.difficulty;
  }
  get gamemode(): ServerProps["gamemode"] {
    return this.props.gamemode;
  }
  get onlineMode(): boolean {
    return this.props.onlineMode;
  }
  get containerId(): string | null {
    return this.props.containerId;
  }
  get dataPath(): string {
    return this.props.dataPath;
  }
  get autoShutdownEnabled(): boolean {
    return this.props.autoShutdownEnabled;
  }
  get lastPlayerLeftAt(): Date | null {
    return this.props.lastPlayerLeftAt;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }
  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  updateStatus(status: ServerStatus): void {
    this.props.status = status;
    this.props.updatedAt = new Date();
  }

  assignContainer(containerId: string): void {
    this.props.containerId = containerId;
    this.props.updatedAt = new Date();
  }

  recordPlayerLeft(): void {
    this.props.lastPlayerLeftAt = new Date();
    this.props.updatedAt = new Date();
  }

  clearLastPlayerLeft(): void {
    this.props.lastPlayerLeftAt = null;
    this.props.updatedAt = new Date();
  }

  updateSettings(
    settings: Partial<
      Pick<
        ServerProps,
        | "name"
        | "maxPlayers"
        | "motd"
        | "difficulty"
        | "gamemode"
        | "onlineMode"
        | "memoryMb"
        | "autoShutdownEnabled"
      >
    >
  ): void {
    Object.assign(this.props, settings);
    this.props.updatedAt = new Date();
  }

  toJSON(): ServerProps {
    // No exponer rconPassword en respuestas de API
    const { rconPassword: _, ...safe } = this.props;
    return { ...safe, rconPassword: "***" } as ServerProps;
  }
}
