import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NotificationsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-surface-muted">
      <View className="px-6 pt-4">
        <Text className="text-white text-2xl font-bold">Notificações</Text>
        {/* TODO: Fase 6 — lista de notificações */}
      </View>
    </SafeAreaView>
  );
}
