import Constants from 'expo-constants';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card } from '@/components/Card';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useTheme } from '@/hooks/useTheme';
import { usePreferences, type ThemeMode } from '@/stores/PreferencesContext';
import { useHabits } from '@/stores/HabitsContext';
import { useToast } from '@/stores/ToastContext';
import { spacing, typography } from '@/theme';

const THEME_OPTIONS: { value: ThemeMode; label: string }[] = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

export default function SettingsScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { prefs, setThemeMode, setHapticsEnabled } = usePreferences();
  const { resetDemo } = useHabits();
  const { show } = useToast();
  const [resetVisible, setResetVisible] = useState(false);
  const [resetting, setResetting] = useState(false);
  const version =
    (Constants.expoConfig?.version as string | undefined) ?? '1.0.0';

  const onConfirmReset = async () => {
    setResetting(true);
    try {
      await resetDemo();
      show({ message: 'Demo data reset', variant: 'success' });
    } catch (err) {
      console.warn('reset demo failed', err);
      show({ message: 'Reset failed', variant: 'error' });
    } finally {
      setResetting(false);
      setResetVisible(false);
    }
  };

  return (
    <ScrollView
      testID="settings-screen"
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={{
        paddingTop: insets.top + spacing.lg,
        padding: spacing.lg,
        paddingBottom: insets.bottom + spacing.xl,
        gap: spacing.lg,
      }}
    >
      <Text style={[typography.h1, { color: theme.colors.textPrimary }]}>Settings</Text>

      <Card colors={theme.colors} scheme={theme.scheme} padding="lg" testID="settings-theme-card">
        <Text style={[typography.h3, { color: theme.colors.textPrimary }]}>Appearance</Text>
        <Text style={[typography.caption, { color: theme.colors.textMuted, marginTop: 4 }]}>
          Theme mode
        </Text>
        <View style={[styles.segment, { backgroundColor: theme.colors.background, borderColor: theme.colors.border, marginTop: spacing.sm }]}>
          {THEME_OPTIONS.map((opt) => {
            const selected = prefs.themeMode === opt.value;
            return (
              <Pressable
                key={opt.value}
                testID={`theme-${opt.value}`}
                accessibilityRole="button"
                accessibilityLabel={`Set theme to ${opt.label}`}
                accessibilityState={{ selected }}
                onPress={() => setThemeMode(opt.value)}
                style={({ pressed }) => [
                  styles.segmentItem,
                  selected && {
                    backgroundColor: theme.colors.primary,
                  },
                  pressed && !selected && { opacity: 0.6 },
                ]}
              >
                <Text
                  style={[
                    typography.bodyBold,
                    { color: selected ? '#FFFFFF' : theme.colors.textPrimary, fontSize: 14 },
                  ]}
                >
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Card>

      <Card colors={theme.colors} scheme={theme.scheme} padding="lg" testID="settings-haptics-card">
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={[typography.h3, { color: theme.colors.textPrimary }]}>Haptics</Text>
            <Text style={[typography.caption, { color: theme.colors.textMuted, marginTop: 2 }]}>
              Subtle feedback when completing habits
            </Text>
          </View>
          <Switch
            testID="haptics-toggle"
            value={prefs.hapticsEnabled}
            onValueChange={setHapticsEnabled}
            trackColor={{ true: theme.colors.primary, false: theme.colors.border }}
          />
        </View>
      </Card>

      <Card colors={theme.colors} scheme={theme.scheme} padding="lg" testID="settings-reset-card">
        <Text style={[typography.h3, { color: theme.colors.textPrimary }]}>Demo data</Text>
        <Text style={[typography.caption, { color: theme.colors.textMuted, marginTop: 4 }]}>
          Reset all habits to the original sample set. Your current habits and history will be deleted.
        </Text>
        <Pressable
          testID="reset-demo-button"
          accessibilityRole="button"
          accessibilityLabel="Reset demo data"
          onPress={() => setResetVisible(true)}
          style={({ pressed }) => [
            styles.dangerBtn,
            { backgroundColor: theme.colors.danger },
            pressed && { opacity: 0.85 },
          ]}
        >
          <Text style={[typography.bodyBold, { color: '#FFFFFF' }]}>Reset demo data</Text>
        </Pressable>
      </Card>

      <Card colors={theme.colors} scheme={theme.scheme} padding="lg" testID="settings-about-card">
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={[typography.h3, { color: theme.colors.textPrimary }]}>About</Text>
            <Text style={[typography.caption, { color: theme.colors.textMuted, marginTop: 2 }]}>
              Version {version}
            </Text>
          </View>
          <Pressable
            testID="about-button"
            accessibilityRole="button"
            accessibilityLabel="About Daily Habits"
            onPress={() => router.push('/about' as never)}
            style={({ pressed }) => [
              styles.linkBtn,
              { borderColor: theme.colors.border },
              pressed && { opacity: 0.6 },
            ]}
          >
            <Text style={[typography.bodyBold, { color: theme.colors.primary }]}>Open</Text>
          </Pressable>
        </View>
      </Card>

      <ConfirmDialog
        visible={resetVisible}
        title="Reset demo data?"
        message="This will delete your current habits and history, then re-seed the sample set."
        confirmLabel={resetting ? 'Resetting…' : 'Reset'}
        cancelLabel="Cancel"
        destructive
        onConfirm={onConfirmReset}
        onCancel={() => setResetVisible(false)}
        testID="confirm-reset-demo"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  segment: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 999,
    overflow: 'hidden',
  },
  segmentItem: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  dangerBtn: {
    minHeight: 48,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  linkBtn: {
    minHeight: 40,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    borderWidth: 1,
  },
});
