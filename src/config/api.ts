import Constants from 'expo-constants';
import { Platform } from 'react-native';

function normalizeUrl(url: string): string {
  return url.trim().replace(/\/+$/, '');
}

export function resolveApiBaseUrl(): string {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl) {
    return normalizeUrl(envUrl);
  }

  const hostUri =
    Constants.expoConfig?.hostUri ??
    (Constants.manifest2 as { extra?: { expoGo?: { debuggerHost?: string } } } | null)?.extra?.expoGo
      ?.debuggerHost ??
    (Constants.manifest as { debuggerHost?: string } | null)?.debuggerHost;

  if (hostUri) {
    const host = hostUri.split(':')[0];
    return `http://${host}:5000/api`;
  }

  const isDev =
    (typeof __DEV__ !== 'undefined' && __DEV__) ||
    process.env.NODE_ENV !== 'production';

  if (isDev) {
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:5000/api';
    }

    return 'http://localhost:5000/api';
  }

  throw new Error('EXPO_PUBLIC_API_URL not configured for production build');
}

export const API_BASE_URL = resolveApiBaseUrl();
