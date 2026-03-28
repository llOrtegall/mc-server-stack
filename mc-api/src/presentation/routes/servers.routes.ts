import { Router, type Request } from "express";
import { z } from "zod";
import { authMiddleware } from "../middlewares/auth.middleware.js";

type IdParams = { id: string };
import type { CreateServerUseCase } from "../../application/server/CreateServerUseCase.js";
import type { StartServerUseCase } from "../../application/server/StartServerUseCase.js";
import type { StopServerUseCase } from "../../application/server/StopServerUseCase.js";
import type { DeleteServerUseCase } from "../../application/server/DeleteServerUseCase.js";
import type { IServerRepository } from "../../domain/server/IServerRepository.js";
import type { DockerService } from "../../infrastructure/docker/DockerService.js";
import { SUPPORTED_MC_VERSIONS } from "../../infrastructure/docker/DockerFactory.js";

const CreateServerSchema = z.object({
  name: z.string().min(1).max(50),
  version: z.enum(SUPPORTED_MC_VERSIONS),
  port: z.number().int().min(25500).max(25600),
  memoryMb: z.number().int().min(512).max(4096).optional(),
  maxPlayers: z.number().int().min(1).max(100).optional(),
  motd: z.string().max(100).optional(),
  difficulty: z.enum(["peaceful", "easy", "normal", "hard"]).optional(),
  gamemode: z.enum(["survival", "creative", "adventure", "spectator"]).optional(),
  onlineMode: z.boolean().optional(),
  autoShutdownEnabled: z.boolean().optional(),
});

const UpdateServerSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  maxPlayers: z.number().int().min(1).max(100).optional(),
  motd: z.string().max(100).optional(),
  difficulty: z.enum(["peaceful", "easy", "normal", "hard"]).optional(),
  gamemode: z.enum(["survival", "creative", "adventure", "spectator"]).optional(),
  onlineMode: z.boolean().optional(),
  memoryMb: z.number().int().min(512).max(4096).optional(),
  autoShutdownEnabled: z.boolean().optional(),
});

export function createServersRouter(deps: {
  serverRepo: IServerRepository;
  dockerService: DockerService;
  createServer: CreateServerUseCase;
  startServer: StartServerUseCase;
  stopServer: StopServerUseCase;
  deleteServer: DeleteServerUseCase;
}): Router {
  const router = Router();

  // GET /servers/versions
  router.get("/versions", authMiddleware, (_req, res) => {
    res.json(SUPPORTED_MC_VERSIONS);
  });

  // GET /servers
  router.get("/", authMiddleware, async (_req, res, next) => {
    try {
      const servers = await deps.serverRepo.findAll();
      res.json(servers.map((s) => s.toJSON()));
    } catch (err) {
      next(err);
    }
  });

  // POST /servers
  router.post("/", authMiddleware, async (req, res, next) => {
    try {
      const input = CreateServerSchema.parse(req.body);
      const server = await deps.createServer.execute(input);
      res.status(201).json(server.toJSON());
    } catch (err) {
      next(err);
    }
  });

  // GET /servers/:id
  router.get("/:id", authMiddleware, async (req: Request<IdParams>, res, next) => {
    try {
      const server = await deps.serverRepo.findById(req.params.id);
      if (!server) {
        res.status(404).json({ error: "Servidor no encontrado" });
        return;
      }
      res.json(server.toJSON());
    } catch (err) {
      next(err);
    }
  });

  // PUT /servers/:id
  router.put("/:id", authMiddleware, async (req: Request<IdParams>, res, next) => {
    try {
      const server = await deps.serverRepo.findById(req.params.id);
      if (!server) {
        res.status(404).json({ error: "Servidor no encontrado" });
        return;
      }
      const updates = UpdateServerSchema.parse(req.body);
      server.updateSettings(updates);
      await deps.serverRepo.update(server);
      res.json(server.toJSON());
    } catch (err) {
      next(err);
    }
  });

  // DELETE /servers/:id
  router.delete("/:id", authMiddleware, async (req: Request<IdParams>, res, next) => {
    try {
      await deps.deleteServer.execute(req.params.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  });

  // POST /servers/:id/start
  router.post("/:id/start", authMiddleware, async (req: Request<IdParams>, res, next) => {
    try {
      await deps.startServer.execute(req.params.id);
      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  });

  // POST /servers/:id/stop
  router.post("/:id/stop", authMiddleware, async (req: Request<IdParams>, res, next) => {
    try {
      await deps.stopServer.execute(req.params.id);
      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  });

  // POST /servers/:id/restart
  router.post("/:id/restart", authMiddleware, async (req: Request<IdParams>, res, next) => {
    try {
      await deps.stopServer.execute(req.params.id);
      await deps.startServer.execute(req.params.id);
      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  });

  // GET /servers/:id/metrics
  router.get("/:id/metrics", authMiddleware, async (req: Request<IdParams>, res, next) => {
    try {
      const server = await deps.serverRepo.findById(req.params.id);
      if (!server?.containerId) {
        res.json({ cpuPercent: 0, memoryUsedMb: 0, memoryLimitMb: server?.memoryMb ?? 1024 });
        return;
      }
      const stats = await deps.dockerService.getStats(server.containerId);
      res.json(stats);
    } catch (err) {
      next(err);
    }
  });

  return router;
}
