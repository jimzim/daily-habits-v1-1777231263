import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { spacing, typography } from '@/theme';

interface HabitDetailStatsProps {
  current: number;
  longest: number;
  monthlyPct: number;
  total: number;
  testID?: string;
}

export function HabitDetailStats({
  current,
  longest,
  monthlyPct,
  total,
  testID = 'habit-stats',
}: HabitDetailStatsProps) {
  const theme = useTheme();
  return (
    <View
      testID={testID}
      style={[styles.row, { backgroundColor: theme.colors.card }]}
    >
      <Stat label="Current" value={`${current}`} suffix="day" colors={theme.colors} testID={`${testID}-current`} />
      <Divider color={theme.colors.border} />
      <Stat label="Longest" value={`${longest}`} suffix="day" colors={theme.colors} testID={`${testID}-longest`} />
      <Divider color={theme.colors.border} />
      <Stat label="This month" value={`${monthlyPct}%`} colors={theme.colors} testID={`${testID}-monthly`} />
      <Divider color={theme.colors.border} />
      <Stat label="Total" value={`${total}`} colors={theme.colors} testID={`${testID}-total`} />
    </View>
  );
}

interface StatProps {
  label: string;
  value: string;
  suffix?: string;
  colors: { textPrimary: string; textMuted: string };
  testID?: string;
}

function Stat({ label, value, suffix, colors, testID }: StatProps) {
  return (
    <View testID={testID} style={styles.cell}>
      <Text
        style={[
          typography.streakDisplay,
          { color: colors.textPrimary, fontSize: 24, lineHeight: 28 },
        ]}
      >
        {value}
      </Text>
      <Text style={[typography.small, { color: colors.textMuted, textAlign: 'center' }]}>
        {label}
        {suffix ? ` (${suffix})` : ''}
      </Text>
    </View>
  );
}

function Divider({ color }: { color: string }) {
  return <View style={[styles.divider, { backgroundColor: color }]} />;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderRadius: 12,
    padding: spacing.md,
  },
  cell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: spacing.sm,
  },
  divider: {
    width: 1,
    alignSelf: 'stretch',
  },
});
