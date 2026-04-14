import { Prisma } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import { AppError } from '../errors/app-error';

export function errorHandler(
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const context = {
    method: req.method,
    path: req.originalUrl,
  };

  if (error instanceof AppError) {
    console.warn('[app:error]', {
      ...context,
      statusCode: error.statusCode,
      message: error.message,
      details: error.details,
    });

    res.status(error.statusCode).json({
      success: false,
      message: error.message,
      errors: error.details,
    });
    return;
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    console.error('[prisma:init:error]', {
      ...context,
      message: error.message,
    });

    res.status(503).json({
      success: false,
      message: 'Banco de dados indispon�vel',
    });
    return;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    console.error('[prisma:known:error]', {
      ...context,
      code: error.code,
      message: error.message,
      meta: error.meta,
    });

    const prismaKnownErrorMap: Record<string, { statusCode: number; message: string }> = {
      P2002: {
        statusCode: 409,
        message: 'Registro duplicado no banco de dados',
      },
      P2021: {
        statusCode: 503,
        message: 'Tabela não encontrada no banco. Execute as migrações no ambiente de produção.',
      },
      P2022: {
        statusCode: 503,
        message: 'Coluna esperada não existe no banco. Execute as migrações no ambiente de produção.',
      },
      P1000: {
        statusCode: 503,
        message: 'Falha de autenticação com o banco de dados.',
      },
      P1001: {
        statusCode: 503,
        message: 'Banco de dados indisponível.',
      },
      P1002: {
        statusCode: 503,
        message: 'Tempo limite ao conectar com o banco de dados.',
      },
      P1003: {
        statusCode: 503,
        message: 'Banco de dados não encontrado.',
      },
    };

    const mapped = prismaKnownErrorMap[error.code] ?? {
      statusCode: 500,
      message: 'Erro interno do servidor',
    };

    res.status(mapped.statusCode).json({
      success: false,
      message: mapped.message,
      errorCode: error.code,
    });
    return;
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    console.error('[prisma:validation:error]', {
      ...context,
      message: error.message,
    });

    res.status(400).json({
      success: false,
      message: 'Dados inv�lidos para opera��o no banco',
    });
    return;
  }

  console.error('[internal:error]', {
    ...context,
    error,
  });

  res.status(500).json({
    success: false,
    message: 'Erro interno do servidor',
  });
}
