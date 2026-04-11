import { prisma } from '../../shared/database/prisma';
import { AppError } from '../../shared/errors/app-error';

type PeriodStatusCounts = {
  PENDING: number;
  CONFIRMED: number;
  COMPLETED: number;
  CANCELED: number;
};

type TopService = {
  serviceId: string;
  name: string;
  count: number;
};

type PeriodSummary = {
  totalAppointments: number;
  statusCounts: PeriodStatusCounts;
  topServices: TopService[];
};

class ReportsService {
  private isValidEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  private isValidPasswordHash(passwordHash: string | null | undefined) {
    if (!passwordHash) {
      return false;
    }

    return /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(passwordHash);
  }

  private isTestUser(input: { name: string; lastName?: string | null; email: string }) {
    const haystack = `${input.name} ${input.lastName ?? ''} ${input.email}`.toLowerCase();
    const testMarkers = ['test', 'teste', 'example', 'fake', 'dummy', 'demo', 'qa', 'mailinator'];

    return testMarkers.some((marker) => haystack.includes(marker));
  }

  private async ensureAdmin(requesterUserId: string) {
    const requester = await prisma.user.findUnique({
      where: { id: requesterUserId },
      select: { role: true },
    });

    if (!requester) {
      throw new AppError('Usuario nao encontrado', 404);
    }

    if (requester.role !== 'ADMIN') {
      throw new AppError('Acesso negado. Apenas admin pode acessar relatorios', 403);
    }
  }

  private async getStatusCounts(start: Date, end: Date): Promise<PeriodStatusCounts> {
    const grouped = await prisma.appointment.groupBy({
      by: ['status'],
      where: {
        scheduledAt: {
          gte: start,
          lt: end,
        },
      },
      _count: {
        status: true,
      },
    });

    const counts: PeriodStatusCounts = {
      PENDING: 0,
      CONFIRMED: 0,
      COMPLETED: 0,
      CANCELED: 0,
    };

    for (const row of grouped) {
      counts[row.status] = row._count.status;
    }

    return counts;
  }

  private async getTopServices(start: Date, end: Date): Promise<TopService[]> {
    const grouped = await prisma.appointment.groupBy({
      by: ['serviceId'],
      where: {
        scheduledAt: {
          gte: start,
          lt: end,
        },
      },
      _count: {
        serviceId: true,
      },
      orderBy: {
        _count: {
          serviceId: 'desc',
        },
      },
      take: 5,
    });

    if (!grouped.length) {
      return [];
    }

    const serviceIds = grouped.map((item) => item.serviceId);
    const services = await prisma.service.findMany({
      where: { id: { in: serviceIds } },
      select: {
        id: true,
        name: true,
      },
    });

    const byId = new Map(services.map((service) => [service.id, service]));

    return grouped.map((item) => ({
      serviceId: item.serviceId,
      name: byId.get(item.serviceId)?.name ?? 'Servico removido',
      count: item._count.serviceId,
    }));
  }

  private async getPeriodSummary(start: Date, end: Date): Promise<PeriodSummary> {
    const [totalAppointments, statusCounts, topServices] = await Promise.all([
      prisma.appointment.count({
        where: {
          scheduledAt: {
            gte: start,
            lt: end,
          },
        },
      }),
      this.getStatusCounts(start, end),
      this.getTopServices(start, end),
    ]);

    return {
      totalAppointments,
      statusCounts,
      topServices,
    };
  }

  private async getActiveValidClientsCount() {
    const clients = await prisma.user.findMany({
      where: { role: 'CLIENT' },
      select: {
        id: true,
        name: true,
        lastName: true,
        email: true,
        passwordHash: true,
      },
    });

    const validClientIds = clients
      .filter((client) => {
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
      })
      .map((client) => client.id);

    if (!validClientIds.length) {
      return 0;
    }

    const activeRows = await prisma.refreshToken.findMany({
      where: {
        userId: { in: validClientIds },
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      select: { userId: true },
      distinct: ['userId'],
    });

    return activeRows.length;
  }

  async getAdminSummary(requesterUserId: string) {
    await this.ensureAdmin(requesterUserId);

    const now = new Date();

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0, 0);

    const yearStart = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
    const nextYearStart = new Date(now.getFullYear() + 1, 0, 1, 0, 0, 0, 0);

    const [month, year, activeValidClients] = await Promise.all([
      this.getPeriodSummary(monthStart, nextMonthStart),
      this.getPeriodSummary(yearStart, nextYearStart),
      this.getActiveValidClientsCount(),
    ]);

    return {
      month,
      year,
      activeValidClients,
      referenceDate: now.toISOString(),
    };
  }
}

export const reportsService = new ReportsService();
