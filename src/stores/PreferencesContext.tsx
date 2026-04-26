import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

export type ThemeMode = 'system' | 'light' | 'dark';

export interface Preferences {
  themeMode: ThemeMode;
  hapticsEnabled: boolean;
}

const DEFAULT_PREFS: Preferences = {
  themeMode: 'system',
  hapticsEnabled: true,
};

const STORAGE_KEY = 'daily-habits.prefs.v1';

interface PreferencesContextValue {
  prefs: Preferences;
  ready: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  setHapticsEnabled: (enabled: boolean) => void;
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<Preferences>(DEFAULT_PREFS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (cancelled) return;
        if (raw) {
          try {
            const parsed = JSON.parse(raw) as Partial<Preferences>;
            setPrefs({ ...DEFAULT_PREFS, ...parsed });
          } catch {
            // ignore corrupt prefs
          }
        }
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(prefs)).catch(() => {});
  }, [prefs, ready]);

  const setThemeMode = useCallback((mode: ThemeMode) => {
    setPrefs((p) => ({ ...p, themeMode: mode }));
  }, []);
  const setHapticsEnabled = useCallback((enabled: boolean) => {
    setPrefs((p) => ({ ...p, hapticsEnabled: enabled }));
  }, []);

  const value = useMemo<PreferencesContextValue>(
    () => ({ prefs, ready, setThemeMode, setHapticsEnabled }),
    [prefs, ready, setThemeMode, setHapticsEnabled]
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences(): PreferencesContextValue {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error('usePreferences must be used inside <PreferencesProvider>');
  return ctx;
}
