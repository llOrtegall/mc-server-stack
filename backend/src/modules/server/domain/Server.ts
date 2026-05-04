import { CpuLimit } from './CpuLimit.js';
import { Port } from './Port.js';
import { RamMb } from './RamMb.js';
import { RconPassword } from './RconPassword.js';
import { ServerName } from './ServerName.js';
import { ServerStatus } from './ServerStatus.js';
import { Version } from './Version.js';

export interface ServerPrimitives {
  id: string | null;
  name: string;
  version: string;
  port: number;
  rconPort: number;
  rconPassword: string;
  containerId: string | null;
  status: string;
  ramMb: number;
  cpuLimit: number;
  createdAt: string | null;
  updatedAt: string | null;
}

export class Server {
  private constructor(
    private readonly id: string | null,
    private readonly name: ServerName,
    private readonly version: Version,
    private readonly port: Port,
    private readonly rconPort: Port,
    private readonly rconPassword: RconPassword,
    private readonly containerId: string | null,
    private readonly status: ServerStatus,
    private readonly ramMb: RamMb,
    private readonly cpuLimit: CpuLimit,
    private readonly createdAt: string | null,
    private readonly updatedAt: string | null,
  ) {}

  static create(props: {
    id: string | null;
    name: ServerName;
    version: Version;
    port: Port;
    rconPort: Port;
    rconPassword: RconPassword;
    containerId: string | null;
    status: ServerStatus;
    ramMb: RamMb;
    cpuLimit: CpuLimit;
    createdAt?: string | null;
    updatedAt?: string | null;
  }): Server {
    return new Server(
      props.id,
      props.name,
      props.version,
      props.port,
      props.rconPort,
      props.rconPassword,
      props.containerId,
      props.status,
      props.ramMb,
      props.cpuLimit,
      props.createdAt ?? null,
      props.updatedAt ?? null,
    );
  }

  /**
   * Builds a brand-new server from raw input: derives the RCON port (port + 1),
   * generates a fresh RCON password and starts in the `stopped` state with no id
   * or container yet (assigned by persistence / runtime).
   */
  static provisionNew(input: {
    name: string;
    version?: string | null;
    port: number;
    ramMb?: number | null;
    cpuLimit?: number | null;
  }): Server {
    const port = Port.create(input.port);
    return Server.create({
      id: null,
      name: ServerName.create(input.name),
      version: Version.create(input.version),
      port,
      rconPort: port.next(),
      rconPassword: RconPassword.generate(),
      containerId: null,
      status: ServerStatus.stopped(),
      ramMb: RamMb.create(input.ramMb),
      cpuLimit: CpuLimit.create(input.cpuLimit),
    });
  }

  static fromPrimitive(data: ServerPrimitives): Server {
    if (!data) throw new Error('Server data must be provided');
    return Server.create({
      id: data.id,
      name: ServerName.fromPrimitive(data.name),
      version: Version.fromPrimitive(data.version),
      port: Port.fromPrimitive(data.port),
      rconPort: Port.fromPrimitive(data.rconPort),
      rconPassword: RconPassword.fromPrimitive(data.rconPassword),
      containerId: data.containerId,
      status: ServerStatus.fromPrimitive(data.status),
      ramMb: RamMb.fromPrimitive(data.ramMb),
      cpuLimit: CpuLimit.fromPrimitive(data.cpuLimit),
      createdAt: data.createdAt ?? null,
      updatedAt: data.updatedAt ?? null,
    });
  }

  getId(): string | null {
    return this.id;
  }

  getContainerId(): string | null {
    return this.containerId;
  }

  withId(id: string): Server {
    return Server.create({ ...this.props(), id });
  }

  withContainerId(containerId: string | null): Server {
    return Server.create({ ...this.props(), containerId });
  }

  withStatus(status: ServerStatus): Server {
    return Server.create({ ...this.props(), status });
  }

  private props() {
    return {
      id: this.id,
      name: this.name,
      version: this.version,
      port: this.port,
      rconPort: this.rconPort,
      rconPassword: this.rconPassword,
      containerId: this.containerId,
      status: this.status,
      ramMb: this.ramMb,
      cpuLimit: this.cpuLimit,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  equals(other: Server): boolean {
    return this.id !== null && this.id === other.id;
  }

  toPrimitive(): ServerPrimitives {
    return {
      id: this.id,
      name: this.name.toPrimitive(),
      version: this.version.toPrimitive(),
      port: this.port.toPrimitive(),
      rconPort: this.rconPort.toPrimitive(),
      rconPassword: this.rconPassword.toPrimitive(),
      containerId: this.containerId,
      status: this.status.toPrimitive(),
      ramMb: this.ramMb.toPrimitive(),
      cpuLimit: this.cpuLimit.toPrimitive(),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  /**
   * Public API representation: the persistence shape minus the RCON password,
   * which is a secret and must never leave the backend.
   */
  toPublic(): Omit<ServerPrimitives, 'rconPassword'> {
    const { rconPassword: _omit, ...rest } = this.toPrimitive();
    return rest;
  }
}
