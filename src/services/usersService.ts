import { apiCall } from '@/src/api/api';
import AuthService from '@/src/services/authService';

export type ProfileResponse = {
  message: string;
  user: {
    id: string;
    name: string;
    lastName?: string | null;
    nickname?: string | null;
    email: string;
    phone?: string | null;
    address?: string | null;
    createdAt: string;
  };
};

export type ClientsListResponse = {
  message: string;
  users: {
    id: string;
    name: string;
    lastName?: string | null;
    email: string;
    phone?: string | null;
    isActive: boolean;
    createdAt: string;
  }[];
};

class UsersService {
  async listClients(): Promise<ClientsListResponse> {
    const token = await AuthService.getValidToken();

    if (!token) {
      throw new Error('Sessão expirada');
    }

    return apiCall<ClientsListResponse>('/users/clients', {
      method: 'GET',
      token,
    });
  }

  async getMe(): Promise<ProfileResponse> {
    const token = await AuthService.getValidToken();

    if (!token) {
      throw new Error('Sess�o expirada');
    }

    return apiCall<ProfileResponse>('/users/me', {
      method: 'GET',
      token,
    });
  }

  async updateMe(data: {
    name?: string;
    lastName?: string;
    nickname?: string;
    email?: string;
    phone?: string;
    address?: string;
  }): Promise<ProfileResponse> {
    const token = await AuthService.getValidToken();

    if (!token) {
      throw new Error('Sess�o expirada');
    }

    return apiCall<ProfileResponse>('/users/me', {
      method: 'PATCH',
      body: data,
      token,
    });
  }
}

export default new UsersService();
