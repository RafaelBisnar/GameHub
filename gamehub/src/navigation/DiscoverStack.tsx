import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useTheme } from '@/context/ThemeContext';
import { DiscoverDetailsScreen } from '@/screens/DiscoverDetailsScreen';
import { DiscoverScreen } from '@/screens/DiscoverScreen';
import type { FreeGameSummary } from '@/types/FreeGame';

export type DiscoverStackParamList = {
  DiscoverList: undefined;
  // The list item is passed along so details can render instantly while the
  // full record (description, screenshots) loads.
  DiscoverDetails: { game: FreeGameSummary };
};

const Stack = createNativeStackNavigator<DiscoverStackParamList>();

export function DiscoverStack() {
  const { colors } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.textPrimary,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="DiscoverList" component={DiscoverScreen} options={{ title: 'Discover' }} />
      <Stack.Screen
        name="DiscoverDetails"
        component={DiscoverDetailsScreen}
        options={{ title: 'Game Details' }}
      />
    </Stack.Navigator>
  );
}
