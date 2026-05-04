export class Port {
  static readonly MIN = 1;
  static readonly MAX = 65535;

  private constructor(private readonly value: number) {}

  static create(port: number): Port {
    Port.ensureIsValid(port);
    return new Port(port);
  }

  static fromPrimitive(port: unknown): Port {
    return Port.create(port as number);
  }

  static ensureIsValid(port: number): void {
    if (typeof port !== 'number' || !Number.isInteger(port)) {
      throw new Error('Port must be an integer');
    }
    if (port < Port.MIN || port > Port.MAX) {
      throw new Error(`Port must be between ${Port.MIN} and ${Port.MAX}`);
    }
  }

  next(): Port {
    return Port.create(this.value + 1);
  }

  toPrimitive(): number {
    return this.value;
  }

  equals(other: Port): boolean {
    return this.value === other.value;
  }
}
