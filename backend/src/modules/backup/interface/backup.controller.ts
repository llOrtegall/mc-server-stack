import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../../../middleware/error.middleware.js';
import { backupFactory } from '../application/factory.js';

function toAppError(err: unknown): unknown {
  if (err instanceof AppError) return err;
  if (err instanceof Error && err.message.includes('not found')) {
    return new AppError(404, 'Backup not found');
  }
  return err;
}

export async function list(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const backups = await backupFactory.listBackups(req.params.id as string);
    res.json(backups.toPrimitive());
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
    const backup = await backupFactory.createBackup(req.params.id as string);
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
