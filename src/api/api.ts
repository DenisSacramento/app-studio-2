// src/api/api.ts
// Configuração base para requisições HTTP

import { API_BASE_URL } from '@/src/config/api';

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string>;
};

export class ApiError extends Error {
  constructor(
    public message: string,
    public status: number,
    public errors?: Record<string, string>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiCall<T>(
  endpoint: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    body?: any;
    token?: string;
  } = {}
): Promise<T> {
  const { method = 'GET', body, token } = options;
  const url = `${API_BASE_URL}${endpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  console.log(`📡 ${method} ${endpoint} (${API_BASE_URL})`);

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const rawBody = await response.text();
    let data: any = {};

    if (rawBody) {
      try {
        data = JSON.parse(rawBody);
      } catch {
        data = { message: 'Resposta inv�lida do servidor' };
      }
    }

    if (!response.ok) {
      console.error(`❌ Erro ${response.status}:`, data);
      throw new ApiError(
        data.message || 'Erro na requisição',
        response.status,
        data.errors
      );
    }

    console.log(`✅ Sucesso ${response.status}`);
    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    console.error('❌ Erro de conexão:', error);
    throw new ApiError(
      'Erro ao conectar com o servidor',
      0
    );
  }
}

export { API_BASE_URL };
