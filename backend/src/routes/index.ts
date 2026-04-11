import { Router } from 'express';
import { appointmentsRoutes } from '../modules/appointments/appointments.routes';
import { authRoutes } from '../modules/auth/auth.routes';
import { reportsRoutes } from '../modules/reports/reports.routes';
import { servicesRoutes } from '../modules/services/services.routes';
import { usersRoutes } from '../modules/users/users.routes';

export const routes = Router();

routes.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'API online',
  });
});

routes.use('/auth', authRoutes);
routes.use('/users', usersRoutes);
routes.use('/services', servicesRoutes);
routes.use('/appointments', appointmentsRoutes);
routes.use('/reports', reportsRoutes);
