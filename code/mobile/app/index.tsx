import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuthStore, selectIsHydrated } from '@/features/auth/store/auth.store';

export default function SplashScreen() {
  const isHydrated = useAuthStore(selectIsHydrated);
  const user       = useAuthStore((s) => s.user);

  // Hydration concluída → deixa o Expo Router redirecionar
  if (isHydrated) {
    return <Redirect href={user ? '/(tabs)/home' : '/(auth)/login'} />;
  }

  // Aguardando SecureStore — mostra splash
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>⚡ UPFIT</Text>
      <ActivityIndicator color="#00d4ff" size="large" style={styles.spinner} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    color: '#00d4ff',
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: 6,
    marginBottom: 16,
  },
  spinner: {},
});
