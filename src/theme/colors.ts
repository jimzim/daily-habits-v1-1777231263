export type ColorScheme = 'light' | 'dark';

export const palette = {
  primary: '#6366F1',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#b91c1c',
  white: '#FFFFFF',
} as const;

export interface ThemeColors {
  primary: string;
  success: string;
  warning: string;
  danger: string;
  background: string;
  card: string;
  cardElevated: string;
  border: string;
  textPrimary: string;
  textMuted: string;
  textInverse: string;
  overlay: string;
  shadow: string;
}

export const lightColors: ThemeColors = {
  primary: palette.primary,
  success: palette.success,
  warning: palette.warning,
  danger: palette.danger,
  background: '#F9FAFB',
  card: '#FFFFFF',
  cardElevated: '#FFFFFF',
  border: '#E5E7EB',
  textPrimary: '#111827',
  textMuted: '#6B7280',
  textInverse: '#FFFFFF',
  overlay: 'rgba(15, 23, 42, 0.5)',
  shadow: 'rgba(15, 23, 42, 0.08)',
};

export const darkColors: ThemeColors = {
  primary: palette.primary,
  success: palette.success,
  warning: palette.warning,
  danger: '#ef4444',
  background: '#0F172A',
  card: '#1E293B',
  cardElevated: '#334155',
  border: '#334155',
  textPrimary: '#F1F5F9',
  textMuted: '#94A3B8',
  textInverse: '#0F172A',
  overlay: 'rgba(0, 0, 0, 0.6)',
  shadow: 'rgba(0, 0, 0, 0.5)',
};

export function getColors(scheme: ColorScheme): ThemeColors {
  return scheme === 'dark' ? darkColors : lightColors;
}

export const habitPalette: string[] = [
  '#6366F1',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#3B82F6',
  '#EC4899',
  '#8B5CF6',
  '#14B8A6',
];
