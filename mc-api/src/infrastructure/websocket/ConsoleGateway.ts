import type { Server as HttpServer } from "http";
import { Server as SocketServer } from "socket.io";
import jwt from "jsonwebtoken";
import type { IServerRepository } from "../../domain/server/IServerRepository.js";
import type { DockerService } from "../docker/DockerService.js";
import { logger } from "../logger.js";

/**
 * ConsoleGateway — WebSocket para la consola en tiempo real.
 *
 * Eventos:
 *  - cliente → servidor: "console:join" ({ serverId })
 *  - cliente → servidor: "console:command" ({ serverId, command })
 *  - servidor → cliente: "console:line" ({ serverId, line, timestamp })
 *  - servidor → cliente: "console:error" ({ message })
 */
export class ConsoleGateway {
  private readonly io: SocketServer;
  // Map de serverId → función para detener el stream de logs
  private readonly activeStreams = new Map<string, () => void>();

  constructor(
    httpServer: HttpServer,
    private readonly serverRepo: IServerRepository,
    private readonly dockerService: DockerService
  ) {
    this.io = new SocketServer(httpServer, {
      cors: {
        origin: process.env.PANEL_URL ?? "*",
        credentials: true,
      },
      path: "/ws",
    });

    this.setupMiddleware();
    this.setupHandlers();
  }

  private setupMiddleware(): void {
    // Autenticación JWT en el handshake de WebSocket
    this.io.use((socket, next) => {
      const token =
        socket.handshake.auth.token ??
        socket.handshake.headers.authorization?.replace("Bearer ", "");

      if (!token) {
        return next(new Error("Token requerido"));
      }

      try {
        jwt.verify(token, process.env.JWT_SECRET ?? "");
        next();
      } catch {
        next(new Error("Token inválido"));
      }
    });
  }

  private setupHandlers(): void {
    this.io.on("connection", (socket) => {
      logger.debug(`WebSocket conectado: ${socket.id}`);

      socket.on("console:join", async ({ serverId }: { serverId: string }) => {
        const server = await this.serverRepo.findById(serverId);
        if (!server) {
          socket.emit("console:error", { message: "Servidor no encontrado" });
          return;
        }
        if (!server.containerId || server.status !== "running") {
          socket.emit("console:error", { message: "El servidor no está corriendo" });
          return;
        }

        // Suscribir al socket a la room del servidor
        await socket.join(`server:${serverId}`);

        // Si no hay un stream activo para este servidor, iniciarlo
        if (!this.activeStreams.has(serverId)) {
          const stopStream = await this.dockerService.streamLogs(
            server.containerId,
            (line) => {
              this.io.to(`server:${serverId}`).emit("console:line", {
                serverId,
                line,
                timestamp: new Date().toISOString(),
              });
            },
            { tail: 100 }
          );
          this.activeStreams.set(serverId, stopStream);
        }

        logger.debug(`Socket ${socket.id} suscrito a consola de ${server.name}`);
      });

      socket.on(
        "console:command",
        async ({ serverId, command }: { serverId: string; command: string }) => {
          const server = await this.serverRepo.findById(serverId);
          if (!server?.containerId) return;

          await this.dockerService.sendCommand(server.containerId, command);
        }
      );

      socket.on("disconnect", () => {
        logger.debug(`WebSocket desconectado: ${socket.id}`);
        // Los streams se limpian cuando no hay más clientes en la room
        for (const [serverId] of this.activeStreams) {
          const room = this.io.sockets.adapter.rooms.get(`server:${serverId}`);
          if (!room || room.size === 0) {
            const stop = this.activeStreams.get(serverId);
            stop?.();
            this.activeStreams.delete(serverId);
            logger.debug(`Stream de consola detenido para servidor ${serverId}`);
          }
        }
      });
    });
  }

  stopStream(serverId: string): void {
    const stop = this.activeStreams.get(serverId);
    if (stop) {
      stop();
      this.activeStreams.delete(serverId);
    }
  }
}
