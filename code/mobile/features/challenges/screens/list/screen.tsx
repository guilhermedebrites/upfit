import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ChallengesScreen() {
  return (
    <SafeAreaView className="flex-1 bg-app-bg">
      <View className="px-6 pt-4">
        <Text className="text-white text-2xl font-bold">Desafios</Text>
        {/* TODO: Fase 5 — listagem e participação em desafios */}
      </View>
    </SafeAreaView>
  );
}
