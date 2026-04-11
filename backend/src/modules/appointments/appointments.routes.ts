import { Router } from 'express';

import {
    AuthenticatedRequest,
    authMiddleware,
} from '../../middlewares/auth.middleware';
import { AppError } from '../../shared/errors/app-error';
import { asyncHandler } from '../../shared/http/async-handler';
import {
    createAppointmentSchema,
    updateAppointmentStatusSchema,
} from './appointments.schemas';
import { appointmentsService } from './appointments.service';

export const appointmentsRoutes = Router();

appointmentsRoutes.get('/', authMiddleware, asyncHandler(async (req, res) => {
  const userId = (req as AuthenticatedRequest).authUser?.userId;

  if (!userId) {
    throw new AppError('Token inv�lido', 401);
  }

  const appointments = await appointmentsService.listForViewer(userId);

  res.status(200).json({
    message: 'Agendamentos carregados com sucesso',
    appointments,
  });
}));

appointmentsRoutes.post('/', authMiddleware, asyncHandler(async (req, res) => {
  const userId = (req as AuthenticatedRequest).authUser?.userId;

  if (!userId) {
    throw new AppError('Token inv�lido', 401);
  }

  const parsed = createAppointmentSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new AppError('Dados de agendamento inv�lidos', 400);
  }

  const appointment = await appointmentsService.create(userId, parsed.data);

  res.status(201).json({
    message: 'Agendamento criado com sucesso',
    appointment,
  });
}));

appointmentsRoutes.patch('/:appointmentId/status', authMiddleware, asyncHandler(async (req, res) => {
  const userId = (req as AuthenticatedRequest).authUser?.userId;

  if (!userId) {
    throw new AppError('Token inv�lido', 401);
  }

  const parsed = updateAppointmentStatusSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new AppError('Status de agendamento inv�lido', 400);
  }

  const appointmentId = String(req.params.appointmentId);
  const appointment = await appointmentsService.updateStatus(
    userId,
    appointmentId,
    parsed.data
  );

  res.status(200).json({
    message: 'Status do agendamento atualizado com sucesso',
    appointment,
  });
}));
