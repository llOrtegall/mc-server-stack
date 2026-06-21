export const SERVER_STATUSES = [
  'provisioning',
  'stopped',
  'starting',
  'running',
  'stopping',
  'error',
] as const;

export type ServerStatusValue = (typeof SERVER_STATUSES)[number];

export class ServerStatus {
  private constructor(private readonly value: ServerStatusValue) {}

  static create(status: ServerStatusValue): ServerStatus {
    ServerStatus.ensureIsValid(status);
    return new ServerStatus(status);
  }

  static fromPrimitive(status: unknown): ServerStatus {
    return ServerStatus.create(status as ServerStatusValue);
  }

  static provisioning(): ServerStatus {
    return ServerStatus.create('provisioning');
  }

  static stopped(): ServerStatus {
    return ServerStatus.create('stopped');
  }

  static error(): ServerStatus {
    return ServerStatus.create('error');
  }

  static ensureIsValid(status: string): asserts status is ServerStatusValue {
    if (!SERVER_STATUSES.includes(status as ServerStatusValue)) {
      throw new Error(
        `Invalid server status "${status}". Allowed: ${SERVER_STATUSES.join(', ')}`,
      );
    }
  }

  toPrimitive(): ServerStatusValue {
    return this.value;
  }

  equals(other: ServerStatus): boolean {
    return this.value === other.value;
  }
}
