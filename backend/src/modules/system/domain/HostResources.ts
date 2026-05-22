export class HostResources {
  private constructor(
    private readonly cpuCores: number,
    private readonly memoryMb: number,
  ) {}

  static create(cpuCores: number, memoryMb: number): HostResources {
    HostResources.ensureIsValid(cpuCores, memoryMb);
    return new HostResources(cpuCores, memoryMb);
  }

  static fromPrimitive(data: {
    cpuCores: number;
    memoryMb: number;
  }): HostResources {
    if (!data) throw new Error('data must be provided');
    return HostResources.create(data.cpuCores, data.memoryMb);
  }

  static ensureIsValid(cpuCores: number, memoryMb: number): void {
    if (
      typeof cpuCores !== 'number' ||
      !Number.isFinite(cpuCores) ||
      cpuCores <= 0
    ) {
      throw new Error('Host CPU cores must be a positive number');
    }
    if (
      typeof memoryMb !== 'number' ||
      !Number.isFinite(memoryMb) ||
      memoryMb <= 0
    ) {
      throw new Error('Host memory must be a positive number');
    }
  }

  getCpuCores(): number {
    return this.cpuCores;
  }

  getMemoryMb(): number {
    return this.memoryMb;
  }

  toPrimitive() {
    return {
      cpuCores: this.cpuCores,
      memoryMb: this.memoryMb,
    };
  }

  equals(other: HostResources): boolean {
    return this.cpuCores === other.cpuCores && this.memoryMb === other.memoryMb;
  }
}
