import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  lastName: z.string().trim().min(2).max(100).optional(),
  nickname: z.string().trim().min(2).max(80).optional(),
  email: z.string().trim().email().transform((value) => value.toLowerCase()).optional(),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+()\-\s]{8,25}$/)
    .optional(),
  address: z.string().trim().min(5).max(255).optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
