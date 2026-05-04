export class CpuLimit {
  static readonly MIN = 0.1;
  static readonly MAX = 8;
  static readonly DEFAULT = 1.0;

  private constructor(private readonly value: number) {}

  static create(cpuLimit?: number | null): CpuLimit {
    const value = cpuLimit ?? CpuLimit.DEFAULT;
    CpuLimit.ensureIsValid(value);
    return new CpuLimit(value);
  }

  static fromPrimitive(cpuLimit: unknown): CpuLimit {
    return CpuLimit.create(cpuLimit as number);
  }

  static ensureIsValid(cpuLimit: number): void {
    if (typeof cpuLimit !== 'number' || Number.isNaN(cpuLimit)) {
      throw new Error('CPU limit must be a number');
    }
    if (cpuLimit < CpuLimit.MIN || cpuLimit > CpuLimit.MAX) {
      throw new Error(
        `CPU limit must be between ${CpuLimit.MIN} and ${CpuLimit.MAX}`,
      );
    }
  }

  toPrimitive(): number {
    return this.value;
  }

  equals(other: CpuLimit): boolean {
    return this.value === other.value;
  }
}
