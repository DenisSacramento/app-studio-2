import { apiCall } from '@/src/api/api';
import AuthService from '@/src/services/authService';

export type ServiceItem = {
  id: string;
  name: string;
  description?: string | null;
  price: string;
  durationMinutes: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

class ServicesService {
  async list() {
    const token = await AuthService.getValidToken();

    if (!token) {
      throw new Error('Sessão expirada');
    }

    return apiCall<{ message: string; services: ServiceItem[] }>('/services', {
      method: 'GET',
      token,
    });
  }

  async create(data: {
    name: string;
    description?: string;
    price: number;
    durationMinutes: number;
  }) {
    const token = await AuthService.getValidToken();

    if (!token) {
      throw new Error('Sessão expirada');
    }

    return apiCall<{ message: string; service: ServiceItem }>('/services', {
      method: 'POST',
      body: data,
      token,
    });
  }

  async update(
    serviceId: string,
    data: {
      name?: string;
      description?: string;
      price?: number;
      durationMinutes?: number;
      isActive?: boolean;
    }
  ) {
    const token = await AuthService.getValidToken();

    if (!token) {
      throw new Error('Sessão expirada');
    }

    return apiCall<{ message: string; service: ServiceItem }>(`/services/${serviceId}`, {
      method: 'PATCH',
      body: data,
      token,
    });
  }

  async remove(serviceId: string) {
    const token = await AuthService.getValidToken();

    if (!token) {
      throw new Error('Sessão expirada');
    }

    return apiCall<{ message: string }>(`/services/${serviceId}`, {
      method: 'DELETE',
      token,
    });
  }
}

export default new ServicesService();
