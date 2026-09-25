import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { NavigatorScreenParams } from '@react-navigation/native';

import { useTheme } from '@/context/ThemeContext';
import { AddGameStack } from '@/navigation/AddGameStack';
import type { GamesStackParamList } from '@/navigation/GamesStack';
import { GamesStack } from '@/navigation/GamesStack';
import { FavoritesScreen } from '@/screens/FavoritesScreen';
import { HomeScreen } from '@/screens/HomeScreen';
import { ProfileScreen } from '@/screens/ProfileScreen';

export type RootTabParamList = {
  Home: undefined;
  Games: NavigatorScreenParams<GamesStackParamList> | undefined;
  AddGame: undefined;
  Favorites: undefined;
  Profile: undefined;
};

type IoniconName = keyof typeof Ionicons.glyphMap;

const TAB_ICONS: Record<keyof RootTabParamList, { active: IoniconName; inactive: IoniconName }> = {
  Home: { active: 'home', inactive: 'home-outline' },
  Games: { active: 'game-controller', inactive: 'game-controller-outline' },
  AddGame: { active: 'add-circle', inactive: 'add-circle-outline' },
  Favorites: { active: 'heart', inactive: 'heart-outline' },
  Profile: { active: 'person', inactive: 'person-outline' },
};

const Tab = createBottomTabNavigator<RootTabParamList>();

export function RootTabs() {
  const { colors } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.surface,
        },
        tabBarIcon: ({ color, size, focused }) => {
          const icon = TAB_ICONS[route.name];
          return <Ionicons name={focused ? icon.active : icon.inactive} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Games" component={GamesStack} options={{ title: 'Games' }} />
      <Tab.Screen name="AddGame" component={AddGameStack} options={{ title: 'Add Game' }} />
      <Tab.Screen name="Favorites" component={FavoritesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
