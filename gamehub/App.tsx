import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useMemo } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Toast } from '@/components/Toast';
import { GameProvider } from '@/context/GameContext';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import { ToastProvider } from '@/context/ToastContext';
import { RootTabs } from '@/navigation/RootTabs';

// Needs to sit inside ThemeProvider so it can read the active palette.
function ThemedApp() {
  const { mode, colors } = useTheme();

  const navigationTheme = useMemo(() => {
    const base = mode === 'dark' ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        background: colors.background,
        card: colors.surface,
        primary: colors.primary,
        text: colors.textPrimary,
        border: colors.surface,
        notification: colors.accent,
      },
    };
  }, [mode, colors]);

  return (
    <>
      <NavigationContainer theme={navigationTheme}>
        <RootTabs />
      </NavigationContainer>
      <Toast />
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <ToastProvider>
          <GameProvider>
            <ThemedApp />
          </GameProvider>
        </ToastProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
