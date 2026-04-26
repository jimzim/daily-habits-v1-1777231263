import * as Haptics from 'expo-haptics';
import { useCallback } from 'react';
import { Platform } from 'react-native';
import { usePreferences } from '@/stores/PreferencesContext';

export type HapticImpact = 'light' | 'medium' | 'heavy';
export type HapticNotice = 'success' | 'warning' | 'error';

interface UseHapticsApi {
  enabled: boolean;
  impact: (style?: HapticImpact) => void;
  notify: (style?: HapticNotice) => void;
  selection: () => void;
}

export function useHaptics(): UseHapticsApi {
  const { prefs } = usePreferences();
  const isWeb = Platform.OS === 'web';
  const enabled = !isWeb && prefs.hapticsEnabled;

  const impact = useCallback(
    (style: HapticImpact = 'light') => {
      if (!enabled) return;
      const map = {
        light: Haptics.ImpactFeedbackStyle.Light,
        medium: Haptics.ImpactFeedbackStyle.Medium,
        heavy: Haptics.ImpactFeedbackStyle.Heavy,
      } as const;
      Haptics.impactAsync(map[style]).catch(() => {});
    },
    [enabled]
  );

  const notify = useCallback(
    (style: HapticNotice = 'success') => {
      if (!enabled) return;
      const map = {
        success: Haptics.NotificationFeedbackType.Success,
        warning: Haptics.NotificationFeedbackType.Warning,
        error: Haptics.NotificationFeedbackType.Error,
      } as const;
      Haptics.notificationAsync(map[style]).catch(() => {});
    },
    [enabled]
  );

  const selection = useCallback(() => {
    if (!enabled) return;
    Haptics.selectionAsync().catch(() => {});
  }, [enabled]);

  return { enabled, impact, notify, selection };
}
