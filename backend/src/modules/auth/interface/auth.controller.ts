import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import type { AuthRequest } from '../../../middleware/auth.middleware.js';
import { AppError } from '../../../middleware/error.middleware.js';
import { authFactory } from '../application/factory.js';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

function toAppError(err: unknown): unknown {
  if (err instanceof AppError) return err;
  if (err instanceof Error) {
    if (err.message.includes('Invalid credentials')) {
      return new AppError(401, 'Invalid credentials');
    }
    if (err.message.includes('not found'))
      return new AppError(404, 'Admin not found');
  }
  return err;
}

export async function login(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const body = loginSchema.safeParse(req.body);
    if (!body.success) {
      throw new AppError(
        400,
        body.error.issues.map((i) => i.message).join(', '),
      );
    }
    const { token, admin } = await authFactory.login(
      body.data.email,
      body.data.password,
    );
    res.json({ token, admin: admin.toPublic() });
  } catch (err) {
    next(toAppError(err));
  }
}

export async function me(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const admin = await authFactory.getAdmin((req as AuthRequest).adminId);
    res.json(admin.toPublic());
  } catch (err) {
    next(toAppError(err));
  }
}
