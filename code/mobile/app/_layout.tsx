import '../global.css';
import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore, selectIsHydrated } from '@/features/auth/store/auth.store';

function RootLayoutNav() {
  const router    = useRouter();
  const segments  = useSegments();
  const hydrated  = useAuthStore(selectIsHydrated);
  const user      = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);

  useEffect(() => {
    // Aguarda hydration e não interfere enquanto login/register está em progresso
    if (!hydrated || isLoading) return;

    const inTabsGroup = segments[0] === '(tabs)';

    // Único caso do guard: sessão expirou ou logout enquanto estava nas tabs
    if (!user && inTabsGroup) {
      router.replace('/(auth)/login');
    }
  }, [hydrated, isLoading, user, segments]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index"   options={{ headerShown: false }} />
      <Stack.Screen name="(auth)"  options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)"  options={{ headerShown: false }} />
      <Stack.Screen name="profile" options={{ headerShown: false }} />
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
