import { z } from 'zod';

export const createServiceSchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(500).optional(),
  price: z.number().positive(),
  durationMinutes: z.number().int().positive().max(600),
});

export const updateServiceSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  description: z.string().trim().max(500).optional(),
  price: z.number().positive().optional(),
  durationMinutes: z.number().int().positive().max(600).optional(),
  isActive: z.boolean().optional(),
});

export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
