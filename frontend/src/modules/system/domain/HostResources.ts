/** Host capacity exposed by the API (camelCase). */
export interface HostResourcesPrimitives {
  cpuCores: number;
  memoryMb: number;
}

export class HostResources {
  private readonly cpuCores: number;
  private readonly memoryMb: number;

  private constructor(cpuCores: number, memoryMb: number) {
    this.cpuCores = cpuCores;
    this.memoryMb = memoryMb;
  }

  static create(cpuCores: number, memoryMb: number): HostResources {
    return new HostResources(cpuCores, memoryMb);
  }

  static fromPrimitive(data: HostResourcesPrimitives): HostResources {
    return HostResources.create(data.cpuCores, data.memoryMb);
  }

  getCpuCores(): number {
    return this.cpuCores;
  }

  getMemoryMb(): number {
    return this.memoryMb;
  }

  toPrimitive(): HostResourcesPrimitives {
    return {
      cpuCores: this.cpuCores,
      memoryMb: this.memoryMb,
    };
  }

  equals(other: HostResources): boolean {
    return this.cpuCores === other.cpuCores && this.memoryMb === other.memoryMb;
  }
}
