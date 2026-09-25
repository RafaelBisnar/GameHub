// Components get the active palette from useTheme() (src/context/ThemeContext),
// never by importing a palette directly, so they follow the light/dark switch.

export const darkColors = {
  background: '#0B0E17',
  surface: '#151A2B',
  primary: '#8B5CF6',
  accent: '#3B82F6',
  highlight: '#39FF88',
  textPrimary: '#F5F5F7',
  textSecondary: '#8A8FA3',
  // Text and icons drawn on top of primary/accent buttons.
  onPrimary: '#F5F5F7',
  // Track of a Switch in its "off" position.
  switchTrack: '#0B0E17',
};

// Same brand colors, deepened so they stay readable on a white background.
export const lightColors: ThemeColors = {
  background: '#F3F4F8',
  surface: '#FFFFFF',
  primary: '#7C3AED',
  accent: '#2563EB',
  highlight: '#15803D',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  onPrimary: '#FFFFFF',
  switchTrack: '#D1D5DB',
};

export type ThemeColors = typeof darkColors;
export type ThemeMode = 'dark' | 'light';
