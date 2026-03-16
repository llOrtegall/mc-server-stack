import "dotenv/config";
import express from "express";
import { createServer } from "http";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";

import { sequelize } from "./infrastructure/persistence/db.js";
import "./infrastructure/persistence/schema.js"; // Registrar modelos Sequelize
import { ServerRepository } from "./infrastructure/persistence/ServerRepository.js";
import { BackupRepository } from "./infrastructure/persistence/BackupRepository.js";
import { DockerService } from "./infrastructure/docker/DockerService.js";
import { RconService } from "./infrastructure/rcon/RconService.js";
import { createStorageService } from "./infrastructure/storage/StorageFactory.js";
import { ConsoleGateway } from "./infrastructure/websocket/ConsoleGateway.js";
import { BackupScheduler } from "./infrastructure/scheduler/BackupScheduler.js";
import { AutoShutdownScheduler } from "./infrastructure/scheduler/AutoShutdownScheduler.js";

import { CreateServerUseCase } from "./application/server/CreateServerUseCase.js";
import { StartServerUseCase } from "./application/server/StartServerUseCase.js";
import { StopServerUseCase } from "./application/server/StopServerUseCase.js";
import { DeleteServerUseCase } from "./application/server/DeleteServerUseCase.js";
import { CreateBackupUseCase } from "./application/backup/CreateBackupUseCase.js";

import authRoutes from "./presentation/routes/auth.routes.js";
import { createServersRouter } from "./presentation/routes/servers.routes.js";
import { createBackupsRouter } from "./presentation/routes/backups.routes.js";
import { createFilesRouter } from "./presentation/routes/files.routes.js";
import { createPlayersRouter } from "./presentation/routes/players.routes.js";
import { errorMiddleware } from "./presentation/middlewares/error.middleware.js";
import { logger } from "./infrastructure/logger.js";

async function bootstrap() {
  const app = express();
  const httpServer = createServer(app);
  const PORT = parseInt(process.env.PORT ?? "3001", 10);

  // ── Seguridad ─────────────────────────────────────────────────────────────
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
    })
  );
  app.use(
    cors({
      origin: process.env.PANEL_URL ?? "http://localhost:3000",
      credentials: true,
    })
  );
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 min
      max: 200,
      standardHeaders: true,
      legacyHeaders: false,
    })
  );
  app.use(express.json({ limit: "10mb" }));
  app.use(cookieParser());

  // ── Conectar BD ──────────────────────────────────────────────────────────
  await sequelize.authenticate();
  logger.info("PostgreSQL conectado");

  // ── Dependencias (manual DI) ───────────────────────────────────────────────
  const serverRepo = new ServerRepository();
  const backupRepo = new BackupRepository();
  const dockerService = new DockerService();
  const rconService = new RconService();
  const storage = createStorageService();

  const createServer_ = new CreateServerUseCase(serverRepo);
  const startServer = new StartServerUseCase(serverRepo, dockerService);
  const stopServer = new StopServerUseCase(serverRepo, dockerService);
  const deleteServer = new DeleteServerUseCase(serverRepo, dockerService);
  const createBackup = new CreateBackupUseCase(serverRepo, backupRepo, storage);

  // ── WebSocket (consola) ───────────────────────────────────────────────────
  new ConsoleGateway(httpServer, serverRepo, dockerService);

  // ── Schedulers ────────────────────────────────────────────────────────────
  new BackupScheduler(serverRepo, createBackup).start();
  new AutoShutdownScheduler(serverRepo, rconService, stopServer).start();

  // ── Rutas ─────────────────────────────────────────────────────────────────
  app.get("/health", (_req, res) => res.json({ status: "ok", timestamp: new Date() }));

  app.use("/auth", authRoutes);
  app.use(
    "/servers",
    createServersRouter({
      serverRepo,
      dockerService,
      createServer: createServer_,
      startServer,
      stopServer,
      deleteServer,
    })
  );
  app.use(
    "/servers/:id/backups",
    createBackupsRouter({ serverRepo, backupRepo, createBackup, storage })
  );
  app.use("/servers/:id/files", createFilesRouter(serverRepo));
  app.use("/servers/:id/players", createPlayersRouter(serverRepo, rconService));

  // ── Error handler (debe ir al final) ─────────────────────────────────────
  app.use(errorMiddleware);

  httpServer.listen(PORT, () => {
    logger.info(`mc-api corriendo en puerto ${PORT}`);
  });

  // Graceful shutdown
  process.on("SIGTERM", () => {
    logger.info("Recibido SIGTERM, apagando servidor...");
    httpServer.close(() => process.exit(0));
  });
}

bootstrap().catch((err) => {
  console.error("Error fatal en bootstrap:", err);
  process.exit(1);
});
