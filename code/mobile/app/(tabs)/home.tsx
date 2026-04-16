import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/features/auth/store/auth.store';

export default function HomeScreen() {
  const logout = useAuthStore((s) => s.logout);
  const user   = useAuthStore((s) => s.user);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.subtitle}>XP · Nível · Streak</Text>
        {user && (
          <Text style={styles.userInfo}>👤 {user.name ?? user.email}</Text>
        )}
        {/* TODO: Fase 3 — home com gamificação */}

        {/* Logout — remover quando a UI de perfil estiver pronta */}
        <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.8}>
          <Text style={styles.logoutText}>SAIR →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: '#0f172a' },
  container:  { paddingHorizontal: 24, paddingTop: 16 },
  title:      { color: '#ffffff', fontSize: 24, fontWeight: 'bold' },
  subtitle:   { color: '#94a3b8', fontSize: 14, marginTop: 4 },
  userInfo:   { color: '#00d4ff', fontSize: 13, marginTop: 8 },
  logoutBtn:  { marginTop: 32, alignSelf: 'flex-start', backgroundColor: '#1e293b', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#334155' },
  logoutText: { color: '#94a3b8', fontSize: 13, fontWeight: '600', letterSpacing: 2 },
});
