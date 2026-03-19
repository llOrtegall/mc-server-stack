import { Router } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { z } from "zod";

const router = Router();

const LoginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

/**
 * POST /auth/login
 * Admin único — credenciales vienen de variables de entorno.
 */
router.post("/login", async (req, res, next) => {
  try {
    const { username, password } = LoginSchema.parse(req.body);

    const validUsername = process.env.ADMIN_USERNAME ?? "admin";
    const validPassword = process.env.ADMIN_PASSWORD ?? "";

    const isUsernameValid = username === validUsername;
    // Comparar con bcrypt si la password está hasheada, o directamente si no
    const isPasswordValid = validPassword.startsWith("$2")
      ? await bcrypt.compare(password, validPassword)
      : password === validPassword;

    if (!isUsernameValid || !isPasswordValid) {
      // Delay para evitar timing attacks en fuerza bruta
      await new Promise((r) => setTimeout(r, 500));
      res.status(401).json({ error: "Credenciales incorrectas" });
      return;
    }

    const token = jwt.sign(
      { username },
      process.env.JWT_SECRET ?? "fallback-secret",
      { expiresIn: process.env.JWT_EXPIRES_IN ?? "24h" }
    );

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000,
      })
      .json({ token, username });
  } catch (err) {
    next(err);
  }
});

router.post("/logout", (_req, res) => {
  res.clearCookie("token").json({ ok: true });
});

export default router;
