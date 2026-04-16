import { apiCall } from '@/src/api/api';
import AuthService from '@/src/services/authService';

export type AppointmentItem = {
  id: string;
  userId: string;
  serviceId: string;
  scheduledAt: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELED';
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    lastName?: string | null;
    email: string;
  };
  service: {
    id: string;
    name: string;
    durationMinutes: number;
    price: string;
  };
};

class AppointmentsService {
  async list() {
    const token = await AuthService.getValidToken();

    if (!token) {
      throw new Error('Sessão expirada');
    }

    const response = await apiCall<{
      message?: string;
      appointments?: AppointmentItem[];
      data?: { appointments?: AppointmentItem[] };
    }>('/appointments', {
      method: 'GET',
      token,
    });

    const parsedAppointments = Array.isArray(response.appointments)
      ? response.appointments
      : Array.isArray(response.data?.appointments)
        ? response.data.appointments
        : [];

    return {
      ...response,
      appointments: parsedAppointments,
    };
  }

  async create(data: { serviceId: string; scheduledAt: string; notes?: string }) {
    const token = await AuthService.getValidToken();

    if (!token) {
      throw new Error('Sessão expirada');
    }

    return apiCall<{ message: string; appointment: AppointmentItem }>('/appointments', {
      method: 'POST',
      body: data,
      token,
    });
  }

  async updateStatus(
    appointmentId: string,
    status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELED'
  ) {
    const token = await AuthService.getValidToken();

    if (!token) {
      throw new Error('Sessão expirada');
    }

    return apiCall<{ message: string; appointment: AppointmentItem }>(
      `/appointments/${appointmentId}/status`,
      {
        method: 'PATCH',
        body: { status },
        token,
      }
    );
  }
}

export default new AppointmentsService();
