import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RegisterScreen() {
  return (
    <SafeAreaView className="flex-1 bg-surface-muted items-center justify-center">
      <View className="w-full max-w-sm px-6">
        <Text className="text-white text-3xl font-bold mb-2">UpFit</Text>
        <Text className="text-slate-400 text-base mb-8">Criar conta</Text>
        {/* TODO: Fase 2 — formulário de cadastro */}
      </View>
    </SafeAreaView>
  );
}
