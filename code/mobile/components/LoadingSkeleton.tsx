import { View } from 'react-native';

interface Props {
  rows?:   number;
  height?: number;
}

export function LoadingSkeleton({ rows = 3, height = 72 }: Props) {
  return (
    <View className="px-4 gap-3">
      {Array.from({ length: rows }).map((_, i) => (
        <View key={i} style={{ height }} className="bg-surface rounded-xl opacity-50" />
      ))}
    </View>
  );
}
