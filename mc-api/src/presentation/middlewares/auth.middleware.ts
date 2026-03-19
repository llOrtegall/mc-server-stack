import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  admin?: { username: string };
}

export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : req.cookies?.token;

  if (!token) {
    res.status(401).json({ error: "Token requerido" });
    return;
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET ?? "") as {
      username: string;
    };
    req.admin = { username: payload.username };
    next();
  } catch {
    res.status(401).json({ error: "Token inválido o expirado" });
  }
}
