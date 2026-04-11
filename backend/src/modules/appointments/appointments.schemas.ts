import { z } from 'zod';

export const createAppointmentSchema = z.object({
  serviceId: z.string().uuid('ServiceId inválido'),
  scheduledAt: z.string().datetime({ offset: true, message: 'Data/hora inválida' }),
  notes: z.string().trim().max(500).optional(),
});

export const updateAppointmentStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELED']),
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type UpdateAppointmentStatusInput = z.infer<typeof updateAppointmentStatusSchema>;
