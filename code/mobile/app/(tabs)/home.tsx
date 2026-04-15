import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-surface-muted">
      <View className="px-6 pt-4">
        <Text className="text-white text-2xl font-bold">Dashboard</Text>
        <Text className="text-slate-400 text-sm mt-1">XP · Nível · Streak</Text>
        {/* TODO: Fase 3 — home com gamificação */}
      </View>
    </SafeAreaView>
  );
}
