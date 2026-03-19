import { Router } from "express";
import { z } from "zod";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import type { IServerRepository } from "../../domain/server/IServerRepository.js";
import type { RconService } from "../../infrastructure/rcon/RconService.js";
import { DockerFactory } from "../../infrastructure/docker/DockerFactory.js";

const PlayerSchema = z.object({ playerName: z.string().min(1).max(16) });
const BanSchema = z.object({
  playerName: z.string().min(1).max(16),
  reason: z.string().optional(),
});

export function createPlayersRouter(
  serverRepo: IServerRepository,
  rconService: RconService
): Router {
  const router = Router({ mergeParams: true });

  async function getRconParams(serverId: string) {
    const server = await serverRepo.findById(serverId);
    if (!server) throw new Error("Servidor no encontrado");
    if (server.status !== "running") throw new Error("El servidor no está corriendo");
    const host = DockerFactory.getContainerName(serverId);
    return { host, port: server.rconPort, password: server.rconPassword };
  }

  // GET /servers/:id/players — jugadores online
  router.get("/", authMiddleware, async (req, res, next) => {
    try {
      const { host, port, password } = await getRconParams(req.params.id);
      const result = await rconService.getPlayerList(host, port, password);
      res.json(result);
    } catch (err) {
      next(err);
    }
  });

  // POST /servers/:id/players/whitelist
  router.post("/whitelist", authMiddleware, async (req, res, next) => {
    try {
      const { playerName } = PlayerSchema.parse(req.body);
      const { host, port, password } = await getRconParams(req.params.id);
      const response = await rconService.addToWhitelist(host, port, password, playerName);
      res.json({ ok: true, response });
    } catch (err) {
      next(err);
    }
  });

  // DELETE /servers/:id/players/whitelist/:name
  router.delete("/whitelist/:name", authMiddleware, async (req, res, next) => {
    try {
      const { host, port, password } = await getRconParams(req.params.id);
      const response = await rconService.removeFromWhitelist(host, port, password, req.params.name);
      res.json({ ok: true, response });
    } catch (err) {
      next(err);
    }
  });

  // POST /servers/:id/players/ban
  router.post("/ban", authMiddleware, async (req, res, next) => {
    try {
      const { playerName, reason } = BanSchema.parse(req.body);
      const { host, port, password } = await getRconParams(req.params.id);
      const response = await rconService.banPlayer(host, port, password, playerName, reason);
      res.json({ ok: true, response });
    } catch (err) {
      next(err);
    }
  });

  // POST /servers/:id/players/unban/:name
  router.post("/unban/:name", authMiddleware, async (req, res, next) => {
    try {
      const { host, port, password } = await getRconParams(req.params.id);
      const response = await rconService.pardonPlayer(host, port, password, req.params.name);
      res.json({ ok: true, response });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
