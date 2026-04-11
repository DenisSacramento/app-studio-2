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
    loginSchema,
    refreshTokenSchema,
    registerSchema,
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

  const result = await authService.login(parsed.data);

  res.status(200).json(result);
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
