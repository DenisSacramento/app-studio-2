import Constants from 'expo-constants';

function normalizeUrl(url: string): string {
  return url.trim().replace(/\/+$/, '');
}

export function resolveApiBaseUrl(): string {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl) {
    return normalizeUrl(envUrl);
  }

  const fallbackFromExpoConfig =
    Constants.expoConfig?.extra && typeof Constants.expoConfig.extra === 'object'
      ? (Constants.expoConfig.extra as { EXPO_PUBLIC_API_URL?: string }).EXPO_PUBLIC_API_URL
      : undefined;

  if (fallbackFromExpoConfig) {
    return normalizeUrl(fallbackFromExpoConfig);
  }

  throw new Error('EXPO_PUBLIC_API_URL not configured. Set EXPO_PUBLIC_API_URL=https://app-studio-2.onrender.com/api');
}

export const API_BASE_URL = resolveApiBaseUrl();
