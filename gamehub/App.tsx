import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Toast } from '@/components/Toast';
import { GameProvider } from '@/context/GameContext';
import { ToastProvider } from '@/context/ToastContext';
import { RootTabs } from '@/navigation/RootTabs';
import { colors } from '@/theme/colors';

const navigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.background,
    card: colors.surface,
    primary: colors.primary,
    text: colors.textPrimary,
    border: colors.surface,
    notification: colors.accent,
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <ToastProvider>
        <GameProvider>
          <NavigationContainer theme={navigationTheme}>
            <RootTabs />
          </NavigationContainer>
          <Toast />
          <StatusBar style="light" />
        </GameProvider>
      </ToastProvider>
    </SafeAreaProvider>
  );
}
