import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/theme/colors';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

interface TabConfig {
  name:     string;
  label:    string;
  icon:     IoniconName;
  iconFill: IoniconName;
}

const TABS: TabConfig[] = [
  { name: 'home',       label: 'HUD',      icon: 'home-outline',    iconFill: 'home'    },
  { name: 'workouts',   label: 'TREINOS',  icon: 'barbell-outline', iconFill: 'barbell' },
  { name: 'groups',     label: 'GUILDAS',  icon: 'people-outline',  iconFill: 'people'  },
  { name: 'challenges', label: 'DESAFIOS', icon: 'trophy-outline',  iconFill: 'trophy'  },
];

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown:            false,
        tabBarStyle:            {
          backgroundColor: '#111111',
          borderTopColor:  'rgba(255,255,255,0.06)',
          height:          60,
          paddingBottom:   8,
        },
        tabBarActiveTintColor:   Colors.cyber,
        tabBarInactiveTintColor: Colors.faint,
        tabBarLabelStyle:        { fontSize: 9, fontWeight: '700', letterSpacing: 1 },
        tabBarItemStyle:         { flex: 1 },
      }}
    >
      {TABS.map(({ name, label, icon, iconFill }) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title:      label,
            tabBarIcon: ({ focused, color }) => (
              <Ionicons
                name={focused ? iconFill : icon}
                size={22}
                color={color}
              />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
