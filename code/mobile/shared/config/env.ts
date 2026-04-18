import { Platform } from 'react-native';

/**
 * No emulador Android, `localhost` aponta para o próprio emulador — não para
 * o Mac host. O endereço correto do host no Android é `10.0.2.2`.
 * No iOS Simulator e em produção, `localhost` funciona normalmente.
 */
function resolveApiUrl(): string {
  const raw = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';
  if (Platform.OS === 'android') {
    return raw.replace('localhost', '10.0.2.2');
  }
  return raw;
}

export const ENV = {
  API_BASE_URL: resolveApiUrl(),
} as const;
