import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

const BIOMETRIC_ENABLED_KEY = 'biometric_enabled';
const BIOMETRIC_TOKEN_KEY = 'biometric_token';
const BIOMETRIC_EMAIL_KEY = 'biometric_email';

export type BiometricType = 'fingerprint' | 'face' | 'unknown';

class BiometricService {
  /**
   * Verificar se device suporta autenticação biométrica
   */
  static async isAvailable(): Promise<boolean> {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      return compatible && enrolled;
    } catch (error) {
      console.error('❌ Erro ao verificar biometria:', error);
      return false;
    }
  }

  /**
   * Obter tipos de autenticação biométrica disponíveis
   */
  static async getAvailableTypes(): Promise<BiometricType[]> {
    try {
      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
      const result: BiometricType[] = [];

      // types é um número (bitmask)
      // 1 = fingerprint, 2 = face, 3 = iris
      if (types && (types & LocalAuthentication.AuthenticationType.FINGERPRINT || 
                   types & LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        if (types & LocalAuthentication.AuthenticationType.FINGERPRINT) {
          result.push('fingerprint');
        }
        if (types & LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION) {
          result.push('face');
        }
      }

      return result.length > 0 ? result : ['unknown'];
    } catch (error) {
      console.error('❌ Erro ao listar tipos de biometria:', error);
      return ['unknown'];
    }
  }

  /**
   * Habilitar autenticação biométrica
   */
  static async enableBiometric(token: string, refreshToken: string, email: string): Promise<boolean> {
    try {
      // Verificar se biometria está disponível
      const isAvailable = await this.isAvailable();
      if (!isAvailable) {
        throw new Error('Biometria não disponível neste dispositivo');
      }

      // Autenticar com biometria (usar para confirmar)
      const result = await LocalAuthentication.authenticateAsync({
        reason: 'Confirme com biometria para ativar login rápido',
        fallbackLabel: 'Use sua senha',
        disableDeviceFallback: false,
      });

      if (!result.success) {
        throw new Error('Autenticação biométrica falhou');
      }

      // Armazenar tokens no SecureStore
      await SecureStore.setItemAsync(BIOMETRIC_TOKEN_KEY, token);
      await SecureStore.setItemAsync(BIOMETRIC_EMAIL_KEY, email);
      
      // Marcar como habilitado em AsyncStorage
      await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, 'true');

      console.log('✅ Biometria habilitada com sucesso');
      return true;
    } catch (error) {
      console.error('❌ Erro ao habilitar biometria:', error);
      return false;
    }
  }

  /**
   * Verificar se biometria está habilitada
   */
  static async isBiometricEnabled(): Promise<boolean> {
    try {
      const enabled = await AsyncStorage.getItem(BIOMETRIC_ENABLED_KEY);
      return enabled === 'true';
    } catch (error) {
      console.error('❌ Erro ao verificar se biometria está habilitada:', error);
      return false;
    }
  }

  /**
   * Autenticar com biometria para obter token
   */
  static async authenticateWithBiometric(): Promise<{ token: string; email: string } | null> {
    try {
      // Verificar se biometria está habilitada
      const isEnabled = await this.isBiometricEnabled();
      if (!isEnabled) {
        throw new Error('Biometria não está habilitada');
      }

      // Autenticar
      const result = await LocalAuthentication.authenticateAsync({
        reason: 'Autentique para acessar sua conta',
        fallbackLabel: 'Use sua senha',
        disableDeviceFallback: false,
      });

      if (!result.success) {
        throw new Error('Autenticação biométrica falhou');
      }

      // Recuperar token do SecureStore
      const token = await SecureStore.getItemAsync(BIOMETRIC_TOKEN_KEY);
      const email = await SecureStore.getItemAsync(BIOMETRIC_EMAIL_KEY);

      if (!token || !email) {
        throw new Error('Tokens biométricos não encontrados');
      }

      return { token, email };
    } catch (error) {
      console.error('❌ Erro ao autenticar com biometria:', error);
      return null;
    }
  }

  /**
   * Desabilitar biometria
   */
  static async disableBiometric(): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(BIOMETRIC_ENABLED_KEY);
      await SecureStore.deleteItemAsync(BIOMETRIC_TOKEN_KEY);
      await SecureStore.deleteItemAsync(BIOMETRIC_EMAIL_KEY);
      console.log('✅ Biometria desabilitada');
      return true;
    } catch (error) {
      console.error('❌ Erro ao desabilitar biometria:', error);
      return false;
    }
  }
}

export default BiometricService;
