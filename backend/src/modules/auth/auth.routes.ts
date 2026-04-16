import { Router } from 'express';
import rateLimit from 'express-rate-limit';

import {
  AuthenticatedRequest,
  authMiddleware,
} from '../../middlewares/auth.middleware';
import { prisma } from '../../shared/database/prisma';
import { AppError } from '../../shared/errors/app-error';
import { asyncHandler } from '../../shared/http/async-handler';
import {
  forgotPasswordSchema,
  loginSchema,
  refreshTokenSchema,
  registerSchema,
  resetPasswordSchema,
} from './auth.schemas';
import { authService } from './auth.service';

export const authRoutes = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
});

authRoutes.post('/register', authLimiter, asyncHandler(async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);

  if (!parsed.success) {
    const errors = Object.fromEntries(
      Object.entries(parsed.error.flatten().fieldErrors).map(([key, value]) => [
        key,
        value?.[0] ?? 'Valor inv�lido',
      ])
    );

    throw new AppError('Dados de cadastro inv�lidos', 400, errors);
  }

  const result = await authService.register(parsed.data);

  res.status(201).json(result);
}));

authRoutes.post('/login', authLimiter, asyncHandler(async (req, res) => {
  console.log('[auth:login] tentativa recebida', {
    email: req.body?.email,
    hasPassword: Boolean(req.body?.password),
  });

  const parsed = loginSchema.safeParse(req.body);

  if (!parsed.success) {
    const errors = Object.fromEntries(
      Object.entries(parsed.error.flatten().fieldErrors).map(([key, value]) => [
        key,
        value?.[0] ?? 'Valor inv�lido',
      ])
    );

    throw new AppError('Dados de login inv�lidos', 400, errors);
  }

  try {
    const result = await authService.login(parsed.data);

    console.log('[auth:login] sucesso', {
      userId: result.user.id,
      email: result.user.email,
      role: result.user.role,
    });

    res.status(200).json(result);
  } catch (error) {
    if (error instanceof AppError && error.message === 'Credenciais inválidas') {
      console.warn('[auth:login] credenciais inválidas', {
        email: parsed.data.email,
      });

      res.status(400).json({ message: 'Credenciais inválidas', errors: { email: 'Email ou senha inválidos', password: 'Email ou senha inválidos' } });
      return;
    }

    throw error;
  }
}));

authRoutes.post('/refresh', authLimiter, asyncHandler(async (req, res) => {
  const parsed = refreshTokenSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new AppError('Refresh token inv�lido', 400);
  }

  const result = await authService.refreshSession(parsed.data.refreshToken);

  res.status(200).json(result);
}));

authRoutes.post('/logout', asyncHandler(async (req, res) => {
  const parsed = refreshTokenSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new AppError('Refresh token inv�lido', 400);
  }

  await authService.revokeRefreshToken(parsed.data.refreshToken);

  res.status(200).json({
    message: 'Logout realizado com sucesso',
  });
}));

authRoutes.post('/forgot-password', authLimiter, asyncHandler(async (req, res) => {
  const parsed = forgotPasswordSchema.safeParse(req.body);

  if (!parsed.success) {
    const errors = Object.fromEntries(
      Object.entries(parsed.error.flatten().fieldErrors).map(([key, value]) => [
        key,
        value?.[0] ?? 'Valor inválido',
      ])
    );

    throw new AppError('Dados inválidos', 400, errors);
  }

  const result = await authService.requestPasswordReset(parsed.data);

  res.status(200).json(result);
}));

authRoutes.post('/reset-password', authLimiter, asyncHandler(async (req, res) => {
  const parsed = resetPasswordSchema.safeParse(req.body);

  if (!parsed.success) {
    const errors = Object.fromEntries(
      Object.entries(parsed.error.flatten().fieldErrors).map(([key, value]) => [
        key,
        value?.[0] ?? 'Valor inválido',
      ])
    );

    throw new AppError('Dados inválidos', 400, errors);
  }

  const result = await authService.resetPassword(parsed.data);

  res.status(200).json(result);
}));

authRoutes.get('/profile', authMiddleware, asyncHandler(async (req, res) => {
  const userId = (req as AuthenticatedRequest).authUser?.userId;

  if (!userId) {
    throw new AppError('Token inválido', 401);
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new AppError('Usuário não encontrado', 404);
  }

  res.status(200).json({
    message: 'Perfil carregado com sucesso',
    user: {
      ...user,
      createdAt: user.createdAt.toISOString(),
    },
  });
}));
