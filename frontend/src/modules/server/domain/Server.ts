import {
  DEFAULT_PROPERTIES,
  type ServerPropertiesPrimitives,
} from './ServerProperties.js';
import { ServerStatus } from './ServerStatus.js';

/** Public server shape exposed by the API (camelCase, no rconPassword). */
export interface ServerPrimitives {
  id: string;
  name: string;
  edition: string;
  version: string;
  port: number;
  rconPort: number;
  containerId: string | null;
  status: string;
  ramMb: number;
  cpuLimit: number;
  properties: ServerPropertiesPrimitives;
  createdAt: string;
  updatedAt: string;
}

export class Server {
  private readonly id: string;
  private readonly name: string;
  private readonly edition: string;
  private readonly version: string;
  private readonly port: number;
  private readonly rconPort: number;
  private readonly containerId: string | null;
  private readonly status: ServerStatus;
  private readonly ramMb: number;
  private readonly cpuLimit: number;
  private readonly properties: ServerPropertiesPrimitives;
  private readonly createdAt: string;
  private readonly updatedAt: string;

  private constructor(props: {
    id: string;
    name: string;
    edition: string;
    version: string;
    port: number;
    rconPort: number;
    containerId: string | null;
    status: ServerStatus;
    ramMb: number;
    cpuLimit: number;
    properties: ServerPropertiesPrimitives;
    createdAt: string;
    updatedAt: string;
  }) {
    this.id = props.id;
    this.name = props.name;
    this.edition = props.edition;
    this.version = props.version;
    this.port = props.port;
    this.rconPort = props.rconPort;
    this.containerId = props.containerId;
    this.status = props.status;
    this.ramMb = props.ramMb;
    this.cpuLimit = props.cpuLimit;
    this.properties = props.properties;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static fromPrimitive(data: ServerPrimitives): Server {
    if (!data) throw new Error('Server data must be provided');
    return new Server({
      id: data.id,
      name: data.name,
      edition: data.edition ?? 'java',
      version: data.version,
      port: data.port,
      rconPort: data.rconPort,
      containerId: data.containerId,
      status: ServerStatus.fromPrimitive(data.status),
      ramMb: data.ramMb,
      cpuLimit: data.cpuLimit,
      properties: data.properties ?? DEFAULT_PROPERTIES,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }

  getId(): string {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getEdition(): string {
    return this.edition;
  }

  isBedrock(): boolean {
    return this.edition === 'bedrock';
  }

  getVersion(): string {
    return this.version;
  }

  getPort(): number {
    return this.port;
  }

  getRconPort(): number {
    return this.rconPort;
  }

  getStatus(): ServerStatus {
    return this.status;
  }

  getRamMb(): number {
    return this.ramMb;
  }

  getCpuLimit(): number {
    return this.cpuLimit;
  }

  getProperties(): ServerPropertiesPrimitives {
    return this.properties;
  }

  getCreatedAt(): string {
    return this.createdAt;
  }

  equals(other: Server): boolean {
    return this.id === other.id;
  }

  toPrimitive(): ServerPrimitives {
    return {
      id: this.id,
      name: this.name,
      edition: this.edition,
      version: this.version,
      port: this.port,
      rconPort: this.rconPort,
      containerId: this.containerId,
      status: this.status.toPrimitive(),
      ramMb: this.ramMb,
      cpuLimit: this.cpuLimit,
      properties: this.properties,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
