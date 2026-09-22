import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { EditGameScreen } from '@/screens/EditGameScreen';
import { GameDetailsScreen } from '@/screens/GameDetailsScreen';
import { GamesListScreen } from '@/screens/GamesListScreen';
import { colors } from '@/theme/colors';

export type GamesStackParamList = {
  GamesList: undefined;
  GameDetails: { gameId: string };
  EditGame: { gameId: string };
};

const Stack = createNativeStackNavigator<GamesStackParamList>();

export function GamesStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.textPrimary,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="GamesList" component={GamesListScreen} options={{ title: 'Games' }} />
      <Stack.Screen
        name="GameDetails"
        component={GameDetailsScreen}
        options={{ title: 'Game Details' }}
      />
      <Stack.Screen
        name="EditGame"
        component={EditGameScreen}
        options={{ title: 'Edit Game' }}
      />
    </Stack.Navigator>
  );
}
