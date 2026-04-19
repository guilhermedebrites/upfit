import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { Colors } from '@/theme/colors';

export default function HomeScreen() {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const user   = useAuthStore((s) => s.user);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.sub}>XP · Nível · Streak</Text>

        {user && (
          <Text style={styles.userName}>
            {user.name ?? user.email}
          </Text>
        )}

        {/* TODO: Fase 3 — home com gamificação */}

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={logout}
          activeOpacity={0.8}
        >
          <Text style={styles.logoutText}>SAIR →</Text>
        </TouchableOpacity>
      </View>

      {/* ── FAB: Registrar Treino ── */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/workout/new')}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={22} color={Colors.bg} />
        <Text style={styles.fabText}>REGISTRAR TREINO</Text>
      </TouchableOpacity>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: Colors.bg },
  content: { paddingHorizontal: 24, paddingTop: 16 },

  title:    { color: Colors.white, fontSize: 24, fontWeight: '700' },
  sub:      { color: Colors.muted, fontSize: 13, marginTop: 2 },
  userName: { color: Colors.cyber, fontSize: 13, marginTop: 8 },

  logoutBtn: {
    marginTop:       32,
    alignSelf:       'flex-start',
    backgroundColor: Colors.card,
    paddingHorizontal: 20,
    paddingVertical:   10,
    borderRadius:    10,
    borderWidth:     1,
    borderColor:     'rgba(255,255,255,0.08)',
  },
  logoutText: { color: Colors.muted, fontSize: 13, fontWeight: '600', letterSpacing: 2 },

  // ── FAB ──
  fab: {
    position:        'absolute',
    bottom:          28,
    right:           20,
    left:            20,
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'center',
    gap:             8,
    backgroundColor: Colors.cyber,
    borderRadius:    18,
    paddingVertical: 16,
    shadowColor:     Colors.cyber,
    shadowOffset:    { width: 0, height: 4 },
    shadowOpacity:   0.4,
    shadowRadius:    12,
    elevation:       8,
  },
  fabText: {
    color:         Colors.bg,
    fontSize:      14,
    fontWeight:    '800',
    letterSpacing: 3,
  },
});
