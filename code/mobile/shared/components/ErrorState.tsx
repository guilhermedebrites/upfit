import { View, Text, Pressable } from 'react-native';

interface Props {
  message:  string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: Props) {
  return (
    <View className="flex-1 items-center justify-center py-16 px-6">
      <Text className="text-red-400 text-base font-semibold text-center">{message}</Text>
      {onRetry && (
        <Pressable
          onPress={onRetry}
          className="mt-4 bg-brand px-6 py-3 rounded-xl"
        >
          <Text className="text-white font-semibold">Tentar novamente</Text>
        </Pressable>
      )}
    </View>
  );
}
