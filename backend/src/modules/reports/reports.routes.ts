import { Router } from 'express';

import {
    AuthenticatedRequest,
    authMiddleware,
} from '../../middlewares/auth.middleware';
import { AppError } from '../../shared/errors/app-error';
import { asyncHandler } from '../../shared/http/async-handler';
import { reportsService } from './reports.service';

export const reportsRoutes = Router();

reportsRoutes.get('/summary', authMiddleware, asyncHandler(async (req, res) => {
  const userId = (req as AuthenticatedRequest).authUser?.userId;

  if (!userId) {
    throw new AppError('Token invalido', 401);
  }

  const summary = await reportsService.getAdminSummary(userId);

  res.status(200).json({
    message: 'Relatorio carregado com sucesso',
    summary,
  });
}));
