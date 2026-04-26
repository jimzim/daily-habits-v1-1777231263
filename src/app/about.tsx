import Constants from 'expo-constants';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { spacing, typography } from '@/theme';

export default function AboutScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const version =
    (Constants.expoConfig?.version as string | undefined) ?? '1.0.0';

  return (
    <ScrollView
      testID="about-screen"
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={{
        padding: spacing.lg,
        paddingBottom: insets.bottom + spacing.xl,
        gap: spacing.lg,
      }}
    >
      <View style={styles.hero}>
        <Text style={{ fontSize: 56 }}>🌱</Text>
        <Text style={[typography.h1, { color: theme.colors.textPrimary }]}>Daily Habits</Text>
        <Text style={[typography.caption, { color: theme.colors.textMuted }]}>
          Version {version}
        </Text>
      </View>

      <Section title="Why" theme={theme}>
        Track the small things that compound. Build streaks. Forget about pixels and
        focus on what matters.
      </Section>

      <Section title="Privacy" theme={theme}>
        Daily Habits is local-first. Your habits and completion history are stored only
        on this device using SQLite. No accounts, no servers, no analytics, no tracking.
      </Section>

      <Section title="Acknowledgments" theme={theme}>
        Built with Expo, React Native, expo-sqlite, @gorhom/bottom-sheet, and
        react-native-reanimated. Thanks to everyone shipping open-source.
      </Section>
    </ScrollView>
  );
}

interface SectionProps {
  title: string;
  children: string;
  theme: ReturnType<typeof useTheme>;
}

function Section({ title, children, theme }: SectionProps) {
  return (
    <View style={styles.section}>
      <Text style={[typography.h3, { color: theme.colors.textPrimary }]}>{title}</Text>
      <Text style={[typography.body, { color: theme.colors.textMuted }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.lg },
  section: { gap: spacing.sm },
});
