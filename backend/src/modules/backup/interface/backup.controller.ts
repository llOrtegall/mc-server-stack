import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { AppError } from '../../../middleware/error.middleware.js';
import { backupFactory } from '../application/factory.js';

function toAppError(err: unknown): unknown {
  if (err instanceof AppError) return err;
  if (err instanceof Error) {
    if (err.message.includes('not found')) {
      return new AppError(404, 'Backup not found');
    }
    if (
      err.message.includes('not available') ||
      err.message.includes('not configured')
    ) {
      return new AppError(400, 'Selected backup location is not available');
    }
  }
  return err;
}

const createSchema = z.object({
  location: z.enum(['local', 's3']).optional(),
});

const scheduleSchema = z.object({
  enabled: z.boolean(),
  frequency: z.enum(['hourly', 'every6h', 'daily', 'weekly']),
  retention: z.number().int().min(1).max(50),
  location: z.enum(['local', 's3']),
});

export async function list(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const backups = await backupFactory.listBackups(req.params.id as string);
    res.json({
      backups: backups.toPrimitive(),
      cloudEnabled: backupFactory.cloudEnabled(),
    });
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
    const body = createSchema.safeParse(req.body ?? {});
    if (!body.success) {
      throw new AppError(
        400,
        body.error.issues.map((i) => i.message).join(', '),
      );
    }
    const backup = await backupFactory.createBackup(
      req.params.id as string,
      body.data.location ?? 'local',
    );
    res.status(201).json(backup.toPrimitive());
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
    await backupFactory.deleteBackup(
      req.params.backupId as string,
      req.params.id as string,
    );
    res.status(204).send();
  } catch (err) {
    next(toAppError(err));
  }
}

export async function restore(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await backupFactory.restoreBackup(
      req.params.backupId as string,
      req.params.id as string,
    );
    res.status(204).send();
  } catch (err) {
    next(toAppError(err));
  }
}

export async function getSchedule(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const schedule = await backupFactory.getBackupSchedule(
      req.params.id as string,
    );
    res.json({
      ...schedule.toPrimitive(),
      cloudEnabled: backupFactory.cloudEnabled(),
    });
  } catch (err) {
    next(toAppError(err));
  }
}

export async function saveSchedule(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const body = scheduleSchema.safeParse(req.body);
    if (!body.success) {
      throw new AppError(
        400,
        body.error.issues.map((i) => i.message).join(', '),
      );
    }
    const schedule = await backupFactory.saveBackupSchedule(
      req.params.id as string,
      body.data,
    );
    res.json({
      ...schedule.toPrimitive(),
      cloudEnabled: backupFactory.cloudEnabled(),
    });
  } catch (err) {
    next(toAppError(err));
  }
}
