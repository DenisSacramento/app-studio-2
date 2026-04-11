import { Prisma } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import { AppError } from '../errors/app-error';

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
      errors: error.details,
    });
    return;
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    res.status(503).json({
      success: false,
      message: 'Banco de dados indisponível',
    });
    return;
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    res.status(400).json({
      success: false,
      message: 'Dados inválidos para operação no banco',
    });
    return;
  }

  console.error('Erro interno:', error);
  res.status(500).json({
    success: false,
    message: 'Erro interno do servidor',
  });
}
