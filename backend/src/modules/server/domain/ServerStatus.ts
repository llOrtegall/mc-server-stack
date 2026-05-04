export const SERVER_STATUSES = [
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

  static stopped(): ServerStatus {
    return ServerStatus.create('stopped');
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
