import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { AppError } from '../../../middleware/error.middleware.js';
import { consoleFactory } from '../application/factory.js';

function toAppError(err: unknown): unknown {
  if (err instanceof AppError) return err;
  if (err instanceof Error) {
    if (err.message.includes('not running'))
      return new AppError(400, 'Server is not running');
    if (err.message.includes('not found') || err.message.includes('container'))
      return new AppError(404, 'Server not found or has no container');
  }
  return err;
}

export async function logs(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const tail = Number(req.query.tail ?? 100);
    const output = await consoleFactory.getLogs(req.params.id as string, tail);
    res.json({ logs: output });
  } catch (err) {
    next(toAppError(err));
  }
}

const commandSchema = z.object({ command: z.string().min(1) });

export async function command(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const body = commandSchema.safeParse(req.body);
    if (!body.success) {
      throw new AppError(
        400,
        body.error.issues.map((i) => i.message).join(', '),
      );
    }

    const response = await consoleFactory.sendCommand(
      req.params.id as string,
      body.data.command,
    );
    res.json({ response });
  } catch (err) {
    next(toAppError(err));
  }
}
