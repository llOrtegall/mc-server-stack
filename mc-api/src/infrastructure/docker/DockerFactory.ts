import { resolve } from "path";
import type { ContainerCreateOptions } from "dockerode";
import type { Server } from "../../domain/server/Server.entity.js";

// La imagen custom de Minecraft se build localmente y se etiqueta mc-server
const MC_IMAGE = "mc-server:latest";

/**
 * Factory Pattern — genera la configuración de contenedor Docker para un servidor Minecraft.
 * Centraliza toda la lógica de mapeo entidad → ContainerCreateOptions,
 * facilitando cambios futuros (ej: añadir soporte Paper/Fabric).
 */
export class DockerFactory {
  static buildContainerConfig(server: Server): ContainerCreateOptions {
    const containerName = `mc-server-${server.id}`;
    const memoryBytes = server.memoryMb * 1024 * 1024;

    return {
      name: containerName,
      Image: MC_IMAGE,
      Env: [
        `MC_VERSION=${server.version}`,
        `MC_MEMORY=${server.memoryMb}M`,
        `SERVER_PORT=${server.port}`,
        `RCON_PORT=${server.rconPort}`,
        `RCON_PASSWORD=${server.rconPassword}`,
        `MAX_PLAYERS=${server.maxPlayers}`,
        `MOTD=${server.motd}`,
        `DIFFICULTY=${server.difficulty}`,
        `GAMEMODE=${server.gamemode}`,
        `ONLINE_MODE=${server.onlineMode}`,
      ],
      ExposedPorts: {
        [`${server.port}/tcp`]: {},
        [`${server.rconPort}/tcp`]: {},
      },
      HostConfig: {
        // Limitar recursos para proteger el VPS
        Memory: memoryBytes,
        MemoryReservation: Math.floor(memoryBytes * 0.8),
        CpuPeriod: 100000,
        CpuQuota: 200000, // Máximo 2 cores por servidor
        // Bind mounts para persistencia del mundo
        // resolve() convierte paths relativos (./data/...) a absolutos en dev
        Binds: [`${resolve(server.dataPath)}:/minecraft/world`],
        // Exponer puerto del servidor + RCON (RCON necesario para auto-shutdown y players)
        PortBindings: {
          [`${server.port}/tcp`]: [{ HostPort: `${server.port}` }],
          [`${server.rconPort}/tcp`]: [{ HostPort: `${server.rconPort}` }],
        },
        // Reiniciar solo si se cayó inesperadamente (no en stop manual)
        RestartPolicy: { Name: "on-failure", MaximumRetryCount: 3 },
        // Logging driver con rotación para no llenar el disco
        LogConfig: {
          Type: "json-file",
          Config: {
            "max-size": "50m",
            "max-file": "3",
          },
        },
        // Red interna — el contenedor no necesita acceso a internet después del arranque
        NetworkMode: "bridge",
      },
      Labels: {
        "mc-panel.server-id": server.id,
        "mc-panel.server-name": server.name,
        "mc-panel.version": server.version,
        "mc-panel.managed": "true",
      },
      StopTimeout: 30, // 30s para que el servidor guarde el mundo antes de SIGKILL
    };
  }

  static getContainerName(serverId: string): string {
    return `mc-server-${serverId}`;
  }

  /**
   * Host al que conectarse por RCON.
   * En producción (mc-api dentro de Docker) → container name (Docker DNS).
   * En dev (mc-api fuera de Docker) → localhost (puertos expuestos).
   */
  static getRconHost(serverId: string): string {
    if (process.env.NODE_ENV === "production") {
      return DockerFactory.getContainerName(serverId);
    }
    return "localhost";
  }
}
