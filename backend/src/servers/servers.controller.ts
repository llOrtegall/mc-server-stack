import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { AppError } from '../middleware/error.middleware.js';
import * as serversService from './servers.service.js';

const createSchema = z.object({
  name: z.string().min(1).max(100),
  version: z.string().optional(),
  port: z.number().int().min(1024).max(65534),
  ram_mb: z.number().int().min(512).max(16384).optional(),
  cpu_limit: z.number().min(0.1).max(8).optional(),
});

export async function list(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const servers = await serversService.listServers();
    res.json(servers);
  } catch (err) {
    next(err);
  }
}

export async function get(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const server = await serversService.getServer(req.params.id as string);
    res.json(server);
  } catch (err) {
    next(err);
  }
}

export async function create(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const body = createSchema.safeParse(req.body);
    if (!body.success) {
      throw new AppError(
        400,
        body.error.issues.map((i) => i.message).join(', '),
      );
    }
    const server = await serversService.createServer(body.data);
    res.status(201).json(server);
  } catch (err) {
    next(err);
  }
}

export async function remove(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await serversService.deleteServer(req.params.id as string);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function start(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await serversService.startServer(req.params.id as string);
    res.json({ message: 'Server started' });
  } catch (err) {
    next(err);
  }
}

export async function stop(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await serversService.stopServer(req.params.id as string);
    res.json({ message: 'Server stopped' });
  } catch (err) {
    next(err);
  }
}

export async function restart(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await serversService.restartServer(req.params.id as string);
    res.json({ message: 'Server restarted' });
  } catch (err) {
    next(err);
  }
}
