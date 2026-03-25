import { Router, type Request } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import type { IBackupRepository } from "../../domain/backup/IBackupRepository.js";
import type { IServerRepository } from "../../domain/server/IServerRepository.js";
import type { CreateBackupUseCase } from "../../application/backup/CreateBackupUseCase.js";
import type { IStorageService } from "../../infrastructure/storage/IStorageService.js";

export function createBackupsRouter(deps: {
  serverRepo: IServerRepository;
  backupRepo: IBackupRepository;
  createBackup: CreateBackupUseCase;
  storage: IStorageService;
}): Router {
  const router = Router({ mergeParams: true });

  // GET /servers/:id/backups
  router.get("/", authMiddleware, async (req: Request<{ id: string }>, res, next) => {
    try {
      const backups = await deps.backupRepo.findByServerId(req.params.id);
      res.json(backups.map((b) => b.toJSON()));
    } catch (err) {
      next(err);
    }
  });

  // POST /servers/:id/backups — backup manual
  router.post("/", authMiddleware, async (req: Request<{ id: string }>, res, next) => {
    try {
      const backup = await deps.createBackup.execute(req.params.id);
      res.status(201).json(backup.toJSON());
    } catch (err) {
      next(err);
    }
  });

  // DELETE /servers/:id/backups/:backupId
  router.delete("/:backupId", authMiddleware, async (req: Request<{ id: string; backupId: string }>, res, next) => {
    try {
      const backup = await deps.backupRepo.findById(req.params.backupId);
      if (!backup) {
        res.status(404).json({ error: "Backup no encontrado" });
        return;
      }
      await deps.storage.delete(backup.r2Key);
      await deps.backupRepo.delete(backup.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  });

  return router;
}
