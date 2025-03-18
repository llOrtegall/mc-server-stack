import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { AppError } from './error.middleware.js';

export interface AuthRequest extends Request {
  adminId: string;
}

export function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    next(new AppError(401, 'Missing or invalid authorization header'));
    return;
  }

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, config.jwtSecret) as { id: string };
    (req as AuthRequest).adminId = payload.id;
    next();
  } catch {
    next(new AppError(401, 'Invalid or expired token'));
  }
}
