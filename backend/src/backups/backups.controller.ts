import type { NextFunction, Request, Response } from 'express';
import * as backupsService from './backups.service.js';

export async function list(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const backups = await backupsService.listBackups(req.params.id as string);
    res.json(backups);
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
    const backup = await backupsService.createBackup(req.params.id as string);
    res.status(201).json(backup);
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
    await backupsService.deleteBackup(
      req.params.backupId as string,
      req.params.id as string,
    );
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function restore(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await backupsService.restoreBackup(
      req.params.backupId as string,
      req.params.id as string,
    );
    res.json({ message: 'Backup restored successfully' });
  } catch (err) {
    next(err);
  }
}
