import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(8, 'Senha deve ter pelo menos 8 caracteres')
  .max(128)
  .regex(/[A-Z]/, 'Senha deve conter ao menos uma letra maiuscula')
  .regex(/[a-z]/, 'Senha deve conter ao menos uma letra minuscula')
  .regex(/[0-9]/, 'Senha deve conter ao menos um numero')
  .regex(/[^A-Za-z0-9]/, 'Senha deve conter ao menos um caractere especial');

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100),
  email: z.string().trim().email('Email inv�lido').transform((value) => value.toLowerCase()),
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: z.string().trim().email('Email inv�lido').transform((value) => value.toLowerCase()),
  password: z.string().min(1, 'Senha obrigatoria').max(128),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token obrigatorio'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email('Email inválido').transform((value) => value.toLowerCase()),
});

export const resetPasswordSchema = z.object({
  email: z.string().trim().email('Email inválido').transform((value) => value.toLowerCase()),
  token: z.string().trim().min(10, 'Token obrigatorio').max(255),
  password: passwordSchema,
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
