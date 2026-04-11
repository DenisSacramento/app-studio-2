import { NextFunction, Response } from 'express';
import { prisma } from '../shared/database/prisma';
import { AppError } from '../shared/errors/app-error';
import { AuthenticatedRequest } from './auth.middleware';

export type RoleType = 'CLIENT' | 'ADMIN';

export async function requireRole(
  roles: RoleType | RoleType[]
) {
  return async (
    req: AuthenticatedRequest,
    _res: Response,
    next: NextFunction
  ): Promise<void> => {
    const userId = req.authUser?.userId;

    if (!userId) {
      throw new AppError('Token inválido', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (!allowedRoles.includes(user.role)) {
      throw new AppError('Acesso negado. Privilégios insuficientes', 403);
    }

    next();
  };
}
