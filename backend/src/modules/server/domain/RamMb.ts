export class RamMb {
  static readonly MIN = 512;
  static readonly MAX = 16384;
  static readonly DEFAULT = 1024;

  private constructor(private readonly value: number) {}

  static create(ramMb?: number | null): RamMb {
    const value = ramMb ?? RamMb.DEFAULT;
    RamMb.ensureIsValid(value);
    return new RamMb(value);
  }

  static fromPrimitive(ramMb: unknown): RamMb {
    return RamMb.create(ramMb as number);
  }

  static ensureIsValid(ramMb: number): void {
    if (typeof ramMb !== 'number' || !Number.isInteger(ramMb)) {
      throw new Error('RAM must be an integer (MB)');
    }
    if (ramMb < RamMb.MIN || ramMb > RamMb.MAX) {
      throw new Error(`RAM must be between ${RamMb.MIN} and ${RamMb.MAX} MB`);
    }
  }

  toPrimitive(): number {
    return this.value;
  }

  equals(other: RamMb): boolean {
    return this.value === other.value;
  }
}
