import type { NextFunction, Request, Response } from 'express';
import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../db/index.js';
import { AppError } from '../middleware/error.middleware.js';
import * as consoleService from './console.service.js';

export const consoleRouter = Router({ mergeParams: true });

consoleRouter.get(
  '/logs',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const serverId = req.params.id as string;
      const tail = Number(req.query.tail ?? 100);

      const result = await pool.query<{ container_id: string }>(
        'SELECT container_id FROM servers WHERE id = $1',
        [serverId],
      );
      const server = result.rows[0];
      if (!server?.container_id)
        throw new AppError(404, 'Server not found or has no container');

      const logs = await consoleService.getLogs(server.container_id, tail);
      res.json({ logs });
    } catch (err) {
      next(err);
    }
  },
);

const commandSchema = z.object({ command: z.string().min(1) });

consoleRouter.post(
  '/command',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const serverId = req.params.id as string;
      const body = commandSchema.safeParse(req.body);
      if (!body.success) {
        throw new AppError(
          400,
          body.error.issues.map((i) => i.message).join(', '),
        );
      }

      const response = await consoleService.executeCommand(
        serverId,
        body.data.command,
      );
      res.json({ response });
    } catch (err) {
      next(err);
    }
  },
);
