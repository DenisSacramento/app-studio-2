import { Router } from 'express';

import {
    AuthenticatedRequest,
    authMiddleware,
} from '../../middlewares/auth.middleware';
import { AppError } from '../../shared/errors/app-error';
import { asyncHandler } from '../../shared/http/async-handler';
import { updateProfileSchema } from './users.schemas';
import { usersService } from './users.service';

export const usersRoutes = Router();

usersRoutes.get('/clients', authMiddleware, asyncHandler(async (req, res) => {
  const userId = (req as AuthenticatedRequest).authUser?.userId;

  if (!userId) {
    throw new AppError('Token inválido', 401);
  }

  const users = await usersService.listClientsForAdmin(userId);

  res.status(200).json({
    message: 'Clientes carregados com sucesso',
    users,
  });
}));

usersRoutes.get('/me', authMiddleware, asyncHandler(async (req, res) => {
  const userId = (req as AuthenticatedRequest).authUser?.userId;

  if (!userId) {
    throw new AppError('Token inv�lido', 401);
  }

  const user = await usersService.getMe(userId);

  res.status(200).json({
    message: 'Perfil carregado com sucesso',
    user,
  });
}));

usersRoutes.patch('/me', authMiddleware, asyncHandler(async (req, res) => {
  const userId = (req as AuthenticatedRequest).authUser?.userId;

  if (!userId) {
    throw new AppError('Token inv�lido', 401);
  }

  const parsed = updateProfileSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new AppError('Dados de perfil inv�lidos', 400);
  }

  const user = await usersService.updateMe(userId, parsed.data);

  res.status(200).json({
    message: 'Perfil atualizado com sucesso',
    user,
  });
}));
