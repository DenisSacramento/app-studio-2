// src/services/authService.ts
// Serviço de autenticação - Comunicação com backend

import { apiCall, ApiError } from '@/src/api/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type AuthResponse = {
  message: string;
  token: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
};

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

class AuthService {
  private static TOKEN_KEY = 'auth_token';
  private static REFRESH_TOKEN_KEY = 'refresh_token';
  private static USER_KEY = 'auth_user';

  /**
   * Registrar novo usuário
   */
  static async register(name: string, email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await apiCall<AuthResponse>('/auth/register', {
        method: 'POST',
        body: { name, email, password },
      });

      // Salvar token
      await this.saveToken(response.token);
      await this.saveRefreshToken(response.refreshToken);

      // Salvar usuário
      await AsyncStorage.setItem(
        this.USER_KEY,
        JSON.stringify(response.user)
      );

      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new Error('Erro ao registrar usuário');
    }
  }

  /**
   * Fazer login
   */
  static async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await apiCall<AuthResponse>('/auth/login', {
        method: 'POST',
        body: { email, password },
      });

      // Salvar token
      await this.saveToken(response.token);
      await this.saveRefreshToken(response.refreshToken);

      // Salvar usuário
      await AsyncStorage.setItem(
        this.USER_KEY,
        JSON.stringify(response.user)
      );

      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new Error('Erro ao fazer login');
    }
  }

  /**
   * Obter perfil do usuário autenticado (protegido)
   */
  static async getProfile(): Promise<{ message: string; user: UserProfile }> {
    try {
      const token = await this.getValidToken();
      if (!token) {
        throw new Error('Token não encontrado');
      }

      return apiCall('/auth/profile', {
        method: 'GET',
        token,
      });
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new Error('Erro ao buscar perfil');
    }
  }

  /**
   * Salvar token
   */
  static async saveToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(this.TOKEN_KEY, token);
      console.log('✅ Token salvo com sucesso');
    } catch (error) {
      console.error('❌ Erro ao salvar token:', error);
      throw error;
    }
  }

  /**
   * Salvar refresh token
   */
  static async saveRefreshToken(token: string): Promise<void> {
    await AsyncStorage.setItem(this.REFRESH_TOKEN_KEY, token);
  }

  /**
   * Obter token armazenado
   */
  static async getToken(): Promise<string | null> {
    try {
      const token = await AsyncStorage.getItem(this.TOKEN_KEY);
      return token || null;
    } catch (error) {
      console.error('❌ Erro ao recuperar token:', error);
      return null;
    }
  }

  /**
   * Obter refresh token armazenado
   */
  static async getRefreshToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(this.REFRESH_TOKEN_KEY);
    } catch {
      return null;
    }
  }

  /**
   * Renovar sessão usando refresh token
   */
  static async refreshSession(): Promise<string | null> {
    const refreshToken = await this.getRefreshToken();

    if (!refreshToken) {
      return null;
    }

    try {
      const response = await apiCall<{ message: string; token: string; refreshToken: string }>(
        '/auth/refresh',
        {
          method: 'POST',
          body: { refreshToken },
        }
      );

      await this.saveToken(response.token);
      await this.saveRefreshToken(response.refreshToken);

      return response.token;
    } catch {
      await this.logout();
      return null;
    }
  }

  /**
   * Recupera token válido, renovando sessão se necessário
   */
  static async getValidToken(): Promise<string | null> {
    const token = await this.getToken();

    if (token) {
      return token;
    }

    return this.refreshSession();
  }

  /**
   * Verificar se usuário está autenticado
   */
  static async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    return !!token;
  }

  /**
   * Fazer logout
   */
  static async logout(): Promise<void> {
    try {
      const refreshToken = await this.getRefreshToken();

      if (refreshToken) {
        try {
          await apiCall('/auth/logout', {
            method: 'POST',
            body: { refreshToken },
          });
        } catch {
          // Mesmo com falha no backend, limpamos a sessão local.
        }
      }

      await AsyncStorage.removeItem(this.TOKEN_KEY);
      await AsyncStorage.removeItem(this.REFRESH_TOKEN_KEY);
      await AsyncStorage.removeItem(this.USER_KEY);
      console.log('✅ Logout realizado');
    } catch (error) {
      console.error('❌ Erro ao fazer logout:', error);
      throw error;
    }
  }

  /**
   * Obter usuário armazenado localmente
   */
  static async getStoredUser() {
    try {
      const userJson = await AsyncStorage.getItem(this.USER_KEY);
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      console.error('❌ Erro ao recuperar usuário:', error);
      return null;
    }
  }
}

export default AuthService;
