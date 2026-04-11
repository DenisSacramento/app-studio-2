// src/services/authService.ts
// Serviço de autenticação - Comunicação com backend

import { apiCall, ApiError } from '@/src/api/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type PublicUser = {
  id: string;
  name: string;
  email: string;
  role: 'CLIENT' | 'ADMIN';
};

export type AuthResponse = {
  message: string;
  token: string;
  refreshToken: string;
  user: PublicUser;
};

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  role: 'CLIENT' | 'ADMIN';
  createdAt: string;
};

class AuthService {
  private static TOKEN_KEY = 'auth_token';
  private static REFRESH_TOKEN_KEY = 'refresh_token';
  private static USER_KEY = 'auth_user';
  private static USER_ROLE_KEY = 'auth_user_role';

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

      // Salvar role
      await this.saveUserRole(response.user.role);

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

      // Salvar role
      await this.saveUserRole(response.user.role);

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
      await AsyncStorage.removeItem(this.USER_ROLE_KEY);
      console.log('✅ Logout realizado');
    } catch (error) {
      console.error('❌ Erro ao fazer logout:', error);
      throw error;
    }
  }

  /**
   * Obter role do usuário armazenado
   */
  static async getUserRole(): Promise<'CLIENT' | 'ADMIN' | null> {
    try {
      const role = await AsyncStorage.getItem(this.USER_ROLE_KEY);
      return role as 'CLIENT' | 'ADMIN' | null;
    } catch (error) {
      console.error('❌ Erro ao recuperar role:', error);
      return null;
    }
  }

  /**
   * Salvar role do usuário
   */
  static async saveUserRole(role: 'CLIENT' | 'ADMIN'): Promise<void> {
    try {
      await AsyncStorage.setItem(this.USER_ROLE_KEY, role);
    } catch (error) {
      console.error('❌ Erro ao salvar role:', error);
    }
  }

  /**
   * Salvar usuário autenticado localmente
   */
  static async saveStoredUser(user: PublicUser): Promise<void> {
    try {
      await AsyncStorage.setItem(this.USER_KEY, JSON.stringify(user));
      await this.saveUserRole(user.role);
    } catch (error) {
      console.error('❌ Erro ao salvar usuário local:', error);
      throw error;
    }
  }

  /**
   * Verificar se usuário é admin
   */
  static async isAdmin(): Promise<boolean> {
    const role = await this.getUserRole();
    return role === 'ADMIN';
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
