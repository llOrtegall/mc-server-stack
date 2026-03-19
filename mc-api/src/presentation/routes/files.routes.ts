import { Router } from "express";
import { readdir, readFile, writeFile, mkdir, unlink, rename } from "fs/promises";
import { join, normalize, relative } from "path";
import multer from "multer";
import { createReadStream } from "fs";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import type { IServerRepository } from "../../domain/server/IServerRepository.js";

const upload = multer({ dest: "/tmp/mc-uploads/" });

export function createFilesRouter(serverRepo: IServerRepository): Router {
  const router = Router({ mergeParams: true });

  // Resuelve y valida que el path solicitado esté dentro del directorio del servidor
  function resolveSafePath(serverDataPath: string, reqPath: string): string {
    const resolved = normalize(join(serverDataPath, reqPath ?? "/"));
    // Protección path traversal
    if (!resolved.startsWith(normalize(serverDataPath))) {
      throw new Error("Acceso denegado: path fuera del directorio del servidor");
    }
    return resolved;
  }

  // GET /servers/:id/files?path=/some/dir
  router.get("/", authMiddleware, async (req, res, next) => {
    try {
      const server = await serverRepo.findById(req.params.id);
      if (!server) { res.status(404).json({ error: "Servidor no encontrado" }); return; }

      const targetPath = resolveSafePath(server.dataPath, (req.query.path as string) ?? "/");
      const entries = await readdir(targetPath, { withFileTypes: true });

      res.json(
        entries.map((e) => ({
          name: e.name,
          type: e.isDirectory() ? "directory" : "file",
          path: "/" + relative(server.dataPath, join(targetPath, e.name)),
        }))
      );
    } catch (err) {
      next(err);
    }
  });

  // GET /servers/:id/files/content?path=/server.properties
  router.get("/content", authMiddleware, async (req, res, next) => {
    try {
      const server = await serverRepo.findById(req.params.id);
      if (!server) { res.status(404).json({ error: "Servidor no encontrado" }); return; }

      const filePath = resolveSafePath(server.dataPath, (req.query.path as string) ?? "");
      const content = await readFile(filePath, "utf8");
      res.json({ content });
    } catch (err) {
      next(err);
    }
  });

  // PUT /servers/:id/files/content
  router.put("/content", authMiddleware, async (req, res, next) => {
    try {
      const server = await serverRepo.findById(req.params.id);
      if (!server) { res.status(404).json({ error: "Servidor no encontrado" }); return; }

      const { path: filePath, content } = req.body as { path: string; content: string };
      const safePath = resolveSafePath(server.dataPath, filePath);
      await writeFile(safePath, content, "utf8");
      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  });

  // POST /servers/:id/files/mkdir
  router.post("/mkdir", authMiddleware, async (req, res, next) => {
    try {
      const server = await serverRepo.findById(req.params.id);
      if (!server) { res.status(404).json({ error: "Servidor no encontrado" }); return; }

      const safePath = resolveSafePath(server.dataPath, req.body.path);
      await mkdir(safePath, { recursive: true });
      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  });

  // DELETE /servers/:id/files
  router.delete("/", authMiddleware, async (req, res, next) => {
    try {
      const server = await serverRepo.findById(req.params.id);
      if (!server) { res.status(404).json({ error: "Servidor no encontrado" }); return; }

      const safePath = resolveSafePath(server.dataPath, req.body.path);
      await unlink(safePath);
      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  });

  // POST /servers/:id/files/rename
  router.post("/rename", authMiddleware, async (req, res, next) => {
    try {
      const server = await serverRepo.findById(req.params.id);
      if (!server) { res.status(404).json({ error: "Servidor no encontrado" }); return; }

      const { from, to } = req.body as { from: string; to: string };
      const safeFrom = resolveSafePath(server.dataPath, from);
      const safeTo = resolveSafePath(server.dataPath, to);
      await rename(safeFrom, safeTo);
      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  });

  // POST /servers/:id/files/upload
  router.post("/upload", authMiddleware, upload.single("file"), async (req, res, next) => {
    try {
      const server = await serverRepo.findById(req.params.id);
      if (!server || !req.file) {
        res.status(400).json({ error: "Servidor no encontrado o archivo no recibido" });
        return;
      }

      const destPath = resolveSafePath(
        server.dataPath,
        join((req.body.path as string) ?? "/", req.file.originalname)
      );
      const { rename: fsRename } = await import("fs/promises");
      await fsRename(req.file.path, destPath);
      res.json({ ok: true, path: destPath });
    } catch (err) {
      next(err);
    }
  });

  // GET /servers/:id/files/download?path=/world/...
  router.get("/download", authMiddleware, async (req, res, next) => {
    try {
      const server = await serverRepo.findById(req.params.id);
      if (!server) { res.status(404).json({ error: "Servidor no encontrado" }); return; }

      const safePath = resolveSafePath(server.dataPath, (req.query.path as string) ?? "");
      const filename = safePath.split("/").pop() ?? "file";
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      createReadStream(safePath).pipe(res);
    } catch (err) {
      next(err);
    }
  });

  return router;
}
