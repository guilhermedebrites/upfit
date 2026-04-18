import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/features/auth/store/auth.store';

export default function HomeScreen() {
  const logout = useAuthStore((s) => s.logout);
  const user   = useAuthStore((s) => s.user);

  return (
    <SafeAreaView className="flex-1 bg-app-bg">
      <View className="px-6 pt-4">
        <Text className="text-white text-2xl font-bold">Dashboard</Text>
        <Text className="text-muted text-sm mt-1">XP · Nível · Streak</Text>

        {user && (
          <Text className="text-cyber text-sm mt-2">
            👤 {user.name ?? user.email}
          </Text>
        )}

        {/* TODO: Fase 3 — home com gamificação */}

        {/* Logout — remover quando a UI de perfil estiver pronta */}
        <TouchableOpacity
          className="mt-8 self-start bg-app-card px-5 py-2.5 rounded-lg border border-white/10"
          onPress={logout}
          activeOpacity={0.8}
        >
          <Text
            className="text-muted text-sm font-semibold"
            style={{ letterSpacing: 2 }}
          >
            SAIR →
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
