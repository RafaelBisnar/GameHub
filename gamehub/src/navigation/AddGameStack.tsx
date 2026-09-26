import { createNativeStackNavigator } from '@react-navigation/native-stack';

import type { GameFormValues } from '@/components/GameForm';
import { useTheme } from '@/context/ThemeContext';
import { AddGameScreen } from '@/screens/AddGameScreen';

export type AddGameStackParamList = {
  // prefill comes from the Discover tab; importId tells one import from another.
  AddGame: { prefill?: Partial<GameFormValues>; importId?: number } | undefined;
};

const Stack = createNativeStackNavigator<AddGameStackParamList>();

export function AddGameStack() {
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
      <Stack.Screen name="AddGame" component={AddGameScreen} options={{ title: 'Add Game' }} />
    </Stack.Navigator>
  );
}
