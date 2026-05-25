import { faker } from '@faker-js/faker';
import { CpuLimit } from '../../domain/CpuLimit.js';
import { Port } from '../../domain/Port.js';
import { RamMb } from '../../domain/RamMb.js';
import { RconPassword } from '../../domain/RconPassword.js';
import { Server } from '../../domain/Server.js';
import { ServerName } from '../../domain/ServerName.js';
import {
  ServerProperties,
  type ServerPropertiesInput,
} from '../../domain/ServerProperties.js';
import {
  ServerStatus,
  type ServerStatusValue,
} from '../../domain/ServerStatus.js';
import { Version } from '../../domain/Version.js';

interface ServerOverrides {
  id?: string | null;
  name?: string;
  version?: string;
  port?: number;
  rconPort?: number;
  rconPassword?: string;
  containerId?: string | null;
  status?: ServerStatusValue;
  ramMb?: number;
  cpuLimit?: number;
  properties?: ServerPropertiesInput;
}

export function create(overrides: ServerOverrides = {}): Server {
  const port = overrides.port ?? faker.number.int({ min: 1024, max: 65000 });
  return Server.create({
    id: overrides.id === undefined ? faker.string.uuid() : overrides.id,
    name: ServerName.create(overrides.name ?? faker.lorem.words(2)),
    version: Version.create(overrides.version),
    port: Port.create(port),
    rconPort: Port.create(overrides.rconPort ?? port + 1),
    rconPassword: overrides.rconPassword
      ? RconPassword.create(overrides.rconPassword)
      : RconPassword.generate(),
    containerId:
      overrides.containerId === undefined
        ? faker.string.alphanumeric(12)
        : overrides.containerId,
    status: ServerStatus.create(overrides.status ?? 'stopped'),
    ramMb: RamMb.create(overrides.ramMb),
    cpuLimit: CpuLimit.create(overrides.cpuLimit),
    properties: ServerProperties.create(overrides.properties),
  });
}
