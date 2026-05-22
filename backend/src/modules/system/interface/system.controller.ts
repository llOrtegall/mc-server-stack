import type { NextFunction, Request, Response } from 'express';
import { systemFactory } from '../application/factory.js';

export async function getResources(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const resources = await systemFactory.getHostResources();
    res.json(resources.toPrimitive());
  } catch (err) {
    next(err);
  }
}
