import { useColorScheme } from 'react-native';
import { usePreferences } from '@/stores/PreferencesContext';
import { ColorScheme, getTheme, Theme } from '@/theme';

export function useTheme(): Theme {
  const system = useColorScheme();
  const { prefs } = usePreferences();
  const resolved: ColorScheme = resolveScheme(prefs.themeMode, system === 'dark' ? 'dark' : 'light');
  return getTheme(resolved);
}

export function useColorSchemeResolved(): ColorScheme {
  const system = useColorScheme();
  const { prefs } = usePreferences();
  return resolveScheme(prefs.themeMode, system === 'dark' ? 'dark' : 'light');
}

function resolveScheme(mode: 'system' | 'light' | 'dark', system: ColorScheme): ColorScheme {
  if (mode === 'system') return system;
  return mode;
}
