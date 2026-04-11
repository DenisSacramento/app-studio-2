import { Router } from 'express';

import {
    AuthenticatedRequest,
    authMiddleware,
} from '../../middlewares/auth.middleware';
import { AppError } from '../../shared/errors/app-error';
import { asyncHandler } from '../../shared/http/async-handler';
import { createServiceSchema, updateServiceSchema } from './services.schemas';
import { servicesService } from './services.service';

export const servicesRoutes = Router();

servicesRoutes.get('/', authMiddleware, asyncHandler(async (req, res) => {
  const userId = (req as AuthenticatedRequest).authUser?.userId;

  if (!userId) {
    throw new AppError('Token inv�lido', 401);
  }

  const services = await servicesService.listForViewer(userId);

  res.status(200).json({
    message: 'Servi�os carregados com sucesso',
    services,
  });
}));

servicesRoutes.post('/', authMiddleware, asyncHandler(async (req, res) => {
  const userId = (req as AuthenticatedRequest).authUser?.userId;

  if (!userId) {
    throw new AppError('Token inv�lido', 401);
  }

  const parsed = createServiceSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new AppError('Dados de servi�o inv�lidos', 400);
  }

  const service = await servicesService.create(userId, parsed.data);

  res.status(201).json({
    message: 'Servi�o criado com sucesso',
    service,
  });
}));

servicesRoutes.patch('/:serviceId', authMiddleware, asyncHandler(async (req, res) => {
  const userId = (req as AuthenticatedRequest).authUser?.userId;

  if (!userId) {
    throw new AppError('Token inv�lido', 401);
  }

  const parsed = updateServiceSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new AppError('Dados de servi�o inv�lidos', 400);
  }

  const serviceId = String(req.params.serviceId);
  const service = await servicesService.update(userId, serviceId, parsed.data);

  res.status(200).json({
    message: 'Servi�o atualizado com sucesso',
    service,
  });
}));

servicesRoutes.delete('/:serviceId', authMiddleware, asyncHandler(async (req, res) => {
  const userId = (req as AuthenticatedRequest).authUser?.userId;

  if (!userId) {
    throw new AppError('Token inv�lido', 401);
  }

  const serviceId = String(req.params.serviceId);
  await servicesService.remove(userId, serviceId);

  res.status(200).json({
    message: 'Servi�o removido com sucesso',
  });
}));
