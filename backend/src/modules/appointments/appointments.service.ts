import { prisma } from '../../shared/database/prisma';
import { AppError } from '../../shared/errors/app-error';
import {
    CreateAppointmentInput,
    UpdateAppointmentStatusInput,
} from './appointments.schemas';

class AppointmentsService {
  async listForViewer(userId: string) {
    const requester = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!requester) {
      throw new AppError('Usuário não encontrado', 404);
    }

    return prisma.appointment.findMany({
      where: requester.role === 'ADMIN' ? undefined : { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            lastName: true,
            email: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
            durationMinutes: true,
            price: true,
          },
        },
      },
      orderBy: { scheduledAt: 'asc' },
    });
  }

  async create(userId: string, data: CreateAppointmentInput) {
    const service = await prisma.service.findUnique({
      where: { id: data.serviceId },
      select: { id: true, isActive: true },
    });

    if (!service || !service.isActive) {
      throw new AppError('Servi�o indispon�vel para agendamento', 400);
    }

    const scheduledAtDate = new Date(data.scheduledAt);

    if (scheduledAtDate.getTime() <= Date.now()) {
      throw new AppError('Agendamento deve ser em data futura', 400);
    }

    return prisma.appointment.create({
      data: {
        userId,
        serviceId: data.serviceId,
        scheduledAt: scheduledAtDate,
        notes: data.notes,
      },
      include: {
        service: {
          select: {
            id: true,
            name: true,
            durationMinutes: true,
            price: true,
          },
        },
      },
    });
  }

  async updateStatus(userId: string, appointmentId: string, data: UpdateAppointmentStatusInput) {
    const requester = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!requester) {
      throw new AppError('Usuário não encontrado', 404);
    }

    const appointment = await prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        ...(requester.role === 'ADMIN' ? {} : { userId }),
      },
      select: { id: true },
    });

    if (!appointment) {
      throw new AppError('Agendamento n�o encontrado', 404);
    }

    return prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: data.status },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            lastName: true,
            email: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
            durationMinutes: true,
            price: true,
          },
        },
      },
    });
  }
}

export const appointmentsService = new AppointmentsService();
