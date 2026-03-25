import Dockerode from "dockerode";
import type { Server } from "../../domain/server/Server.entity.js";
import { DockerFactory } from "./DockerFactory.js";
import { logger } from "../logger.js";

export interface ContainerStats {
  cpuPercent: number;
  memoryUsedMb: number;
  memoryLimitMb: number;
}

export class DockerService {
  private readonly docker: Dockerode;

  constructor() {
    this.docker = new Dockerode({ socketPath: "/var/run/docker.sock" });
  }

  async createAndStart(server: Server): Promise<string> {
    const config = DockerFactory.buildContainerConfig(server);
    logger.info(
      `Creando contenedor para servidor ${server.name} (${server.version})`
    );
    const container = await this.docker.createContainer(config);
    await container.start();
    logger.info(`Contenedor ${container.id.slice(0, 12)} iniciado`);
    return container.id;
  }

  async stop(containerId: string): Promise<void> {
    const container = this.docker.getContainer(containerId);
    logger.info(`Deteniendo contenedor ${containerId.slice(0, 12)}...`);
    await container.stop({ t: 30 }); // 30s graceful shutdown
  }

  async start(containerId: string): Promise<void> {
    const container = this.docker.getContainer(containerId);
    await container.start();
  }

  async restart(containerId: string): Promise<void> {
    const container = this.docker.getContainer(containerId);
    await container.restart({ t: 30 });
  }

  async remove(containerId: string): Promise<void> {
    const container = this.docker.getContainer(containerId);
    try {
      await container.stop({ t: 10 });
    } catch {
      // Ya puede estar detenido
    }
    await container.remove({ force: true });
    logger.info(`Contenedor ${containerId.slice(0, 12)} eliminado`);
  }

  async getStats(containerId: string): Promise<ContainerStats> {
    const container = this.docker.getContainer(containerId);
    const stats = await container.stats({ stream: false });

    // Calcular CPU% usando el delta entre dos lecturas
    const cpuDelta =
      stats.cpu_stats.cpu_usage.total_usage -
      stats.precpu_stats.cpu_usage.total_usage;
    const systemDelta =
      stats.cpu_stats.system_cpu_usage - stats.precpu_stats.system_cpu_usage;
    const numCpus = stats.cpu_stats.online_cpus ?? 1;
    const cpuPercent =
      systemDelta > 0 ? (cpuDelta / systemDelta) * numCpus * 100 : 0;

    const memoryUsedMb = stats.memory_stats.usage / 1024 / 1024;
    const memoryLimitMb = stats.memory_stats.limit / 1024 / 1024;

    return {
      cpuPercent: Math.round(cpuPercent * 10) / 10,
      memoryUsedMb: Math.round(memoryUsedMb),
      memoryLimitMb: Math.round(memoryLimitMb),
    };
  }

  /**
   * Stream de logs del contenedor hacia un callback.
   * Retorna una función para detener el stream.
   */
  async streamLogs(
    containerId: string,
    onData: (line: string) => void,
    options: { tail?: number } = {}
  ): Promise<() => void> {
    const container = this.docker.getContainer(containerId);
    const stream = await container.logs({
      follow: true,
      stdout: true,
      stderr: true,
      tail: options.tail ?? 100,
    });

    const logStream = stream as NodeJS.ReadableStream & { destroy?: () => void };
    logStream.on("data", (chunk: Buffer) => {
      // Los logs de Docker tienen un header de 8 bytes que hay que remover
      const raw = chunk.toString("utf8");
      const lines = raw.split("\n");
      for (const line of lines) {
        if (line.trim()) {
          // Remover el header de Docker Multiplexed Stream (primeros 8 bytes)
          const cleaned = line.length > 8 ? line.slice(8) : line;
          onData(cleaned.trim());
        }
      }
    });

    return () => {
      logStream.destroy?.();
    };
  }

  /**
   * Enviar un comando al stdin del contenedor (para la consola interactiva).
   */
  async sendCommand(containerId: string, command: string): Promise<void> {
    const container = this.docker.getContainer(containerId);
    const exec = await container.exec({
      Cmd: ["bash", "-c", `echo "${command.replace(/"/g, '\\"')}" > /proc/1/fd/0`],
      AttachStdout: false,
      AttachStderr: false,
    });
    await exec.start({ Detach: true });
  }

  async isRunning(containerId: string): Promise<boolean> {
    try {
      const container = this.docker.getContainer(containerId);
      const info = await container.inspect();
      return info.State.Running;
    } catch {
      return false;
    }
  }

  /**
   * Verificar si el contenedor existe (puede estar stopped).
   */
  async exists(containerId: string): Promise<boolean> {
    try {
      const container = this.docker.getContainer(containerId);
      await container.inspect();
      return true;
    } catch {
      return false;
    }
  }
}
