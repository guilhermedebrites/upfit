import { View, Text } from 'react-native';

interface Props {
  title:        string;
  description?: string;
}

export function EmptyState({ title, description }: Props) {
  return (
    <View className="flex-1 items-center justify-center py-16 px-6">
      <Text className="text-slate-300 text-lg font-semibold text-center">{title}</Text>
      {description && (
        <Text className="text-slate-500 text-sm text-center mt-2">{description}</Text>
      )}
    </View>
  );
}
