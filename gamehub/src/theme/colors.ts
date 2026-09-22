export const colors = {
  background: '#0B0E17',
  surface: '#151A2B',
  primary: '#8B5CF6',
  accent: '#3B82F6',
  highlight: '#39FF88',
  textPrimary: '#F5F5F7',
  textSecondary: '#8A8FA3',
} as const;

export type ColorKey = keyof typeof colors;
