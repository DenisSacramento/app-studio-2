import { Prisma } from '@prisma/client';

import { prisma } from '../../shared/database/prisma';
import { AppError } from '../../shared/errors/app-error';
import { UpdateProfileInput } from './users.schemas';

class UsersService {
  private isValidEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  private isValidPasswordHash(passwordHash: string | null | undefined) {
    if (!passwordHash) {
      return false;
    }

    // Hash bcrypt costuma ter 60 caracteres e prefixo $2a$, $2b$ ou $2y$.
    return /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(passwordHash);
  }

  private isTestUser(input: {
    name: string;
    lastName?: string | null;
    email: string;
  }) {
    const haystack = `${input.name} ${input.lastName ?? ''} ${input.email}`.toLowerCase();
    const testMarkers = ['test', 'teste', 'example', 'fake', 'dummy', 'demo', 'qa', 'mailinator'];

    return testMarkers.some((marker) => haystack.includes(marker));
  }

  async listClientsForAdmin(requesterUserId: string) {
    const requester = await prisma.user.findUnique({
      where: { id: requesterUserId },
      select: { role: true },
    });

    if (!requester) {
      throw new AppError('Usuário não encontrado', 404);
    }

    if (requester.role !== 'ADMIN') {
      throw new AppError('Acesso negado. Apenas admin pode listar clientes', 403);
    }

    const clients = await prisma.user.findMany({
      where: {
        role: 'CLIENT',
      },
      select: {
        id: true,
        name: true,
        lastName: true,
        email: true,
        phone: true,
        passwordHash: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const realClients = clients.filter((client) => {
      if (!this.isValidEmail(client.email)) {
        return false;
      }

      if (!this.isValidPasswordHash(client.passwordHash)) {
        return false;
      }

      if (this.isTestUser(client)) {
        return false;
      }

      return true;
    });

    const activeTokenRows = await prisma.refreshToken.findMany({
      where: {
        user: { role: 'CLIENT' },
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      select: {
        userId: true,
      },
      distinct: ['userId'],
    });

    const activeUserIds = new Set(activeTokenRows.map((row) => row.userId));

    return realClients.map((client) => ({
      id: client.id,
      name: client.name,
      lastName: client.lastName,
      email: client.email,
      phone: client.phone,
      isActive: activeUserIds.has(client.id),
      createdAt: client.createdAt.toISOString(),
    }));
  }

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        lastName: true,
        nickname: true,
        email: true,
        phone: true,
        address: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new AppError('Usu�rio n�o encontrado', 404);
    }

    return {
      ...user,
      createdAt: user.createdAt.toISOString(),
    };
  }

  async updateMe(userId: string, data: UpdateProfileInput) {
    if (!data.name && !data.lastName && !data.nickname && !data.email && !data.phone && !data.address) {
      throw new AppError('Informe ao menos um campo para atualiza��o', 400);
    }

    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data,
        select: {
          id: true,
          name: true,
          lastName: true,
          nickname: true,
          email: true,
          phone: true,
          address: true,
          createdAt: true,
        },
      });

      return {
        ...user,
        createdAt: user.createdAt.toISOString(),
      };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new AppError('Email j� est� em uso', 409, {
          email: 'Email j� cadastrado',
        });
      }

      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new AppError('Usu�rio n�o encontrado', 404);
      }

      throw error;
    }
  }
}

export const usersService = new UsersService();
