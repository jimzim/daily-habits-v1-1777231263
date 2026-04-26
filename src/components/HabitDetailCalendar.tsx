import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { dayOfWeek, monthRange, parseLocal, todayLocal } from '@/utils/date';
import { isExpectedOn, type Frequency } from '@/utils/streak-math';
import { spacing, typography } from '@/theme';

interface HabitDetailCalendarProps {
  habitColor: string;
  frequency: Frequency;
  completedDates: ReadonlySet<string>;
  testID?: string;
}

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export function HabitDetailCalendar({
  habitColor,
  frequency,
  completedDates,
  testID = 'habit-calendar',
}: HabitDetailCalendarProps) {
  const theme = useTheme();
  const today = todayLocal();
  const days = monthRange(today);
  const firstDow = dayOfWeek(days[0]);
  const padding: null[] = Array(firstDow).fill(null);
  const cells: (string | null)[] = [...padding, ...days];

  const monthName = parseLocal(today).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });

  return (
    <View testID={testID} style={[styles.container, { backgroundColor: theme.colors.card }]}>
      <Text style={[typography.h3, { color: theme.colors.textPrimary }]}>{monthName}</Text>

      <View style={styles.weekdayRow}>
        {WEEKDAY_LABELS.map((label, i) => (
          <View key={i} style={styles.cellWrap}>
            <Text style={[typography.small, { color: theme.colors.textMuted, textAlign: 'center' }]}>
              {label}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.grid}>
        {cells.map((ymd, i) => {
          if (!ymd) {
            return <View key={`pad-${i}`} style={styles.cellWrap} />;
          }
          const completed = completedDates.has(ymd);
          const expected = isExpectedOn(frequency, ymd);
          const isToday = ymd === today;
          const dayNum = parseLocal(ymd).getDate();
          return (
            <View key={ymd} style={styles.cellWrap}>
              <View
                testID={`calendar-day-${ymd}`}
                style={[
                  styles.cellInner,
                  expected && {
                    backgroundColor: completed ? habitColor : 'transparent',
                    borderColor: completed ? habitColor : theme.colors.border,
                    borderWidth: completed ? 0 : 1,
                  },
                  isToday && {
                    borderColor: theme.colors.primary,
                    borderWidth: 2,
                  },
                ]}
              >
                <Text
                  style={[
                    typography.small,
                    {
                      color: completed
                        ? '#fff'
                        : !expected
                        ? theme.colors.textMuted
                        : theme.colors.textPrimary,
                      fontWeight: isToday ? '700' : '500',
                    },
                  ]}
                >
                  {dayNum}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: spacing.lg,
    gap: spacing.md,
  },
  weekdayRow: {
    flexDirection: 'row',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cellWrap: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    padding: 2,
  },
  cellInner: {
    flex: 1,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
