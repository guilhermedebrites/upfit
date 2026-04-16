import { Tabs } from 'expo-router';
import { View, Text } from 'react-native';

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  return (
    <View className="items-center">
      <Text className={focused ? 'text-brand text-xs font-semibold' : 'text-slate-500 text-xs'}>
        {label}
      </Text>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown:     false,
        tabBarStyle:     { backgroundColor: '#1e293b', borderTopColor: '#334155' },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title:    'Home',
          tabBarIcon: ({ focused }) => <TabIcon label="Home" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="workouts"
        options={{
          title:    'Treinos',
          tabBarIcon: ({ focused }) => <TabIcon label="Treinos" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="groups"
        options={{
          title:    'Grupos',
          tabBarIcon: ({ focused }) => <TabIcon label="Grupos" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="challenges"
        options={{
          title:    'Desafios',
          tabBarIcon: ({ focused }) => <TabIcon label="Desafios" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title:    'Notificações',
          tabBarIcon: ({ focused }) => <TabIcon label="Avisos" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title:    'Perfil',
          tabBarIcon: ({ focused }) => <TabIcon label="Perfil" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
