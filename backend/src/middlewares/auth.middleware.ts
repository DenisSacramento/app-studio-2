import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { env } from '../config/env';
import { AppError } from '../shared/errors/app-error';

export type AuthenticatedRequest = Request & {
  authUser?: {
    userId: string;
    email?: string;
  };
};

export function authMiddleware(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void {
  const authorization = req.headers.authorization;

  if (!authorization) {
    throw new AppError('Token não informado', 401);
  }

  const [scheme, token] = authorization.split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw new AppError('Token inválido', 401);
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret) as jwt.JwtPayload;

    if (typeof payload.sub !== 'string') {
      throw new AppError('Token inválido', 401);
    }

    req.authUser = {
      userId: payload.sub,
      email: typeof payload.email === 'string' ? payload.email : undefined,
    };

    next();
  } catch {
    throw new AppError('Token inválido ou expirado', 401);
  }
}
