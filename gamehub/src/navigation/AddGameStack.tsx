import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useTheme } from '@/context/ThemeContext';
import { AddGameScreen } from '@/screens/AddGameScreen';

export type AddGameStackParamList = {
  AddGame: undefined;
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
