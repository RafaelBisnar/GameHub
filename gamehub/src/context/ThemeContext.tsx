import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import { darkColors, lightColors } from '@/theme/colors';
import type { ThemeColors, ThemeMode } from '@/theme/colors';

// The chosen mode is saved on the phone so the app remembers it after a restart.
const STORAGE_KEY = 'gamehub.themeMode';

interface ThemeContextValue {
  mode: ThemeMode;
  colors: ThemeColors;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('dark');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (saved === 'dark' || saved === 'light') setModeState(saved);
      })
      .catch(() => {
        // Storage unavailable: just use the default (dark).
      })
      .finally(() => setIsReady(true));
  }, []);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
  }, []);

  const value = useMemo(
    () => ({ mode, colors: mode === 'dark' ? darkColors : lightColors, setMode }),
    [mode, setMode]
  );

  // Wait for the saved choice (a few milliseconds) so the app doesn't flash
  // dark before switching to light.
  if (!isReady) return null;

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

/**
 * Builds a component's StyleSheet from the active palette and rebuilds it when
 * the mode changes. Pass a function defined outside the component:
 *   const createStyles = (colors: ThemeColors) => StyleSheet.create({...});
 *   const styles = useThemedStyles(createStyles);
 */
export function useThemedStyles<T>(factory: (colors: ThemeColors) => T): T {
  const { colors } = useTheme();
  return useMemo(() => factory(colors), [factory, colors]);
}
