import '../global.css';
import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore, selectIsHydrated } from '@/features/auth/store/auth.store';
import { authEvents } from '@/shared/auth/auth-events';

// Rotas públicas — qualquer outra é protegida
const PUBLIC_SEGMENTS = new Set(['(auth)', 'index', undefined]);

function RootLayoutNav() {
  const router    = useRouter();
  const segments  = useSegments();
  const hydrated  = useAuthStore(selectIsHydrated);
  const user      = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const logout    = useAuthStore((s) => s.logout);

  // Redireciona para login quando a sessão expira (refresh token falhou)
  useEffect(() => {
    authEvents.onSessionExpired(async () => {
      await logout();
      router.replace('/(auth)/login');
    });
  }, [logout, router]);

  // Guard de rotas protegidas
  useEffect(() => {
    // Aguarda hydration e não interfere enquanto login/register está em progresso
    if (!hydrated || isLoading) return;

    const isPublicRoute = PUBLIC_SEGMENTS.has(segments[0] as string | undefined);

    if (!user && !isPublicRoute) {
      router.replace('/(auth)/login');
    }
  }, [hydrated, isLoading, user, segments]); 

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0a0a0a' } }}>
      <Stack.Screen name="index"  />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

export default function RootLayout() {
  const hydrate = useAuthStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, []);

  return (
    <>
      <RootLayoutNav />
      <StatusBar style="light" />
    </>
  );
}
