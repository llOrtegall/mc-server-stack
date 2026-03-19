import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { logger } from "../../infrastructure/logger.js";

export function errorMiddleware(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: "Datos de entrada inválidos",
      details: err.errors,
    });
    return;
  }

  const knownErrors = [
    "no encontrado",
    "ya está",
    "puerto",
    "en uso",
    "no está corriendo",
    "ya está detenido",
  ];

  const isKnown = knownErrors.some((msg) =>
    err.message.toLowerCase().includes(msg)
  );

  if (isKnown) {
    res.status(400).json({ error: err.message });
    return;
  }

  logger.error("Error no controlado:", err);
  res.status(500).json({ error: "Error interno del servidor" });
}
