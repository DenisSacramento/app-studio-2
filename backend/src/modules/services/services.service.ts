import { Prisma } from '@prisma/client';

import { prisma } from '../../shared/database/prisma';
import { AppError } from '../../shared/errors/app-error';
import { CreateServiceInput, UpdateServiceInput } from './services.schemas';

class ServicesService {
  async listForViewer(userId: string) {
    const requester = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!requester) {
      throw new AppError('Usuário não encontrado', 404);
    }

    // Admin vê todo o catálogo de serviços existente.
    if (requester.role === 'ADMIN') {
      return prisma.service.findMany({
        orderBy: { createdAt: 'desc' },
      });
    }

    // Cliente só vê os serviços ativos.
    return prisma.service.findMany({
      where: {
        isActive: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  private async ensureAdmin(userId: string) {
    const requester = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!requester) {
      throw new AppError('Usuário não encontrado', 404);
    }

    if (requester.role !== 'ADMIN') {
      throw new AppError('Acesso negado. Apenas admin pode gerenciar serviços', 403);
    }
  }

  async create(userId: string, data: CreateServiceInput) {
    await this.ensureAdmin(userId);

    return prisma.service.create({
      data: {
        ...data,
        price: new Prisma.Decimal(data.price),
        userId,
      },
    });
  }

  async update(userId: string, serviceId: string, data: UpdateServiceInput) {
    await this.ensureAdmin(userId);

    const existing = await prisma.service.findUnique({
      where: { id: serviceId },
      select: { id: true },
    });

    if (!existing) {
      throw new AppError('Servi�o n�o encontrado', 404);
    }

    return prisma.service.update({
      where: { id: serviceId },
      data: {
        ...data,
        price: data.price !== undefined ? new Prisma.Decimal(data.price) : undefined,
      },
    });
  }

  async remove(userId: string, serviceId: string) {
    await this.ensureAdmin(userId);

    const existing = await prisma.service.findUnique({
      where: { id: serviceId },
      select: { id: true },
    });

    if (!existing) {
      throw new AppError('Servi�o n�o encontrado', 404);
    }

    await prisma.service.delete({
      where: { id: serviceId },
    });
  }
}

export const servicesService = new ServicesService();
