import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { AppError } from '../../../middleware/error.middleware.js';
import { serverFactory } from '../application/factory.js';

const propertiesSchema = z
  .object({
    difficulty: z.enum(['peaceful', 'easy', 'normal', 'hard']).optional(),
    gamemode: z
      .enum(['survival', 'creative', 'adventure', 'spectator'])
      .optional(),
    maxPlayers: z.number().int().min(1).max(1000).optional(),
    motd: z.string().max(150).optional(),
    pvp: z.boolean().optional(),
    seed: z.string().max(100).optional(),
    hardcore: z.boolean().optional(),
    onlineMode: z.boolean().optional(),
    viewDistance: z.number().int().min(3).max(32).optional(),
    whitelistEnabled: z.boolean().optional(),
    whitelist: z.array(z.string()).optional(),
  })
  .optional();

const createSchema = z.object({
  name: z.string().min(1).max(100),
  edition: z.enum(['java', 'bedrock']).optional(),
  version: z.string().optional(),
  port: z.number().int().min(1024).max(65534),
  ramMb: z.number().int().min(512).max(16384).optional(),
  cpuLimit: z.number().min(0.1).max(8).optional(),
  properties: propertiesSchema,
});

const updateSchema = z.object({
  properties: propertiesSchema,
});

/**
 * Translates the plain `Error`s thrown by the (HTTP-agnostic) use cases into the
 * proper `AppError` status codes. Unknown errors bubble up as 500.
 */
function toAppError(err: unknown): unknown {
  if (err instanceof AppError) return err;
  if (err instanceof Error) {
    if (err.message.includes('not found'))
      return new AppError(404, 'Server not found');
    if (err.message.includes('has no container')) {
      return new AppError(400, 'Server has no container');
    }
  }
  return err;
}

export async function list(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const servers = await serverFactory.listServers();
    res.json(servers.toPublic());
  } catch (err) {
    next(toAppError(err));
  }
}

export async function get(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const server = await serverFactory.getServer(req.params.id as string);
    res.json(server.toPublic());
  } catch (err) {
    next(toAppError(err));
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
    const server = await serverFactory.createServer(body.data);
    res.status(201).json(server.toPublic());
  } catch (err) {
    next(toAppError(err));
  }
}

export async function update(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const body = updateSchema.safeParse(req.body);
    if (!body.success) {
      throw new AppError(
        400,
        body.error.issues.map((i) => i.message).join(', '),
      );
    }
    const server = await serverFactory.updateServerProperties(
      req.params.id as string,
      body.data.properties,
    );
    res.json(server.toPublic());
  } catch (err) {
    next(toAppError(err));
  }
}

export async function remove(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await serverFactory.deleteServer(req.params.id as string);
    res.status(204).send();
  } catch (err) {
    next(toAppError(err));
  }
}

export async function start(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await serverFactory.startServer(req.params.id as string);
    res.status(204).send();
  } catch (err) {
    next(toAppError(err));
  }
}

export async function stop(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await serverFactory.stopServer(req.params.id as string);
    res.status(204).send();
  } catch (err) {
    next(toAppError(err));
  }
}

export async function restart(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await serverFactory.restartServer(req.params.id as string);
    res.status(204).send();
  } catch (err) {
    next(toAppError(err));
  }
}
