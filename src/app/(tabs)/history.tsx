import { router } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { StreakBadge } from '@/components/StreakBadge';
import { useTheme } from '@/hooks/useTheme';
import { useHabits } from '@/stores/HabitsContext';
import { addDays, monthRange, todayLocal } from '@/utils/date';
import {
  currentStreak,
  isExpectedOn,
  longestStreak,
  monthlyCompletionPct,
} from '@/utils/streak-math';
import { spacing, typography } from '@/theme';

export default function HistoryScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { habits, completions } = useHabits();
  const today = todayLocal();
  const month = useMemo(() => monthRange(today), [today]);

  const summaries = useMemo(() => {
    return habits.map((h) => {
      const dates = new Set(completions.filter((c) => c.habitId === h.id).map((c) => c.date));
      return {
        habit: h,
        current: currentStreak(dates, h.frequency, today),
        longest: longestStreak(dates, h.frequency, addDays(today, -365), today),
        monthlyPct: monthlyCompletionPct(dates, h.frequency, month),
        total: dates.size,
      };
    });
  }, [habits, completions, today, month]);

  const totalCompletions = useMemo(
    () => completions.length,
    [completions]
  );

  const todayProgress = useMemo(() => {
    const expectedToday = habits.filter((h) => isExpectedOn(h.frequency, today));
    if (expectedToday.length === 0) return { done: 0, total: 0 };
    const completedSet = new Set(
      completions.filter((c) => c.date === today).map((c) => c.habitId)
    );
    const done = expectedToday.filter((h) => completedSet.has(h.id)).length;
    return { done, total: expectedToday.length };
  }, [habits, completions, today]);

  if (habits.length === 0) {
    return (
      <View
        testID="history-screen"
        style={{ flex: 1, backgroundColor: theme.colors.background, paddingTop: insets.top }}
      >
        <EmptyState
          testID="history-empty"
          icon="📊"
          title="No history yet"
          message="Add a habit on the Today tab. Once you start checking it off, your stats will live here."
        />
      </View>
    );
  }

  return (
    <ScrollView
      testID="history-screen"
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={{
        paddingTop: insets.top + spacing.lg,
        padding: spacing.lg,
        paddingBottom: insets.bottom + spacing.xl,
        gap: spacing.lg,
      }}
    >
      <Text style={[typography.h1, { color: theme.colors.textPrimary }]}>History</Text>

      <Card colors={theme.colors} scheme={theme.scheme} padding="lg" testID="history-overview-card">
        <Text style={[typography.caption, { color: theme.colors.textMuted }]}>Today</Text>
        <Text
          testID="history-today-progress"
          style={[
            typography.h2,
            { color: theme.colors.textPrimary, marginTop: 4 },
          ]}
        >
          {todayProgress.done} of {todayProgress.total} habits done
        </Text>
        <Text
          testID="history-total-completions"
          style={[typography.caption, { color: theme.colors.textMuted, marginTop: spacing.sm }]}
        >
          {totalCompletions} completions tracked all-time
        </Text>
      </Card>

      <View style={{ gap: spacing.md }}>
        {summaries.map(({ habit, current, longest, monthlyPct, total }) => (
          <Pressable
            key={habit.id}
            testID={`history-habit-${habit.id}`}
            accessibilityRole="button"
            accessibilityLabel={`Open ${habit.name} history`}
            onPress={() => router.push(`/habit/${habit.id}` as never)}
            style={({ pressed }) => [
              styles.habitCard,
              {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
              },
              pressed && { opacity: 0.85 },
            ]}
          >
            <View
              style={[
                styles.iconBubble,
                { backgroundColor: habit.color + '22', borderColor: habit.color },
              ]}
            >
              <Text style={{ fontSize: 22 }}>{habit.icon}</Text>
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={[typography.h3, { color: theme.colors.textPrimary }]}>
                {habit.name}
              </Text>
              <Text style={[typography.small, { color: theme.colors.textMuted }]}>
                Best {longest} • Month {monthlyPct}% • {total} total
              </Text>
            </View>
            {current > 0 ? <StreakBadge count={current} colors={theme.colors} /> : null}
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  habitCard: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
  },
  iconBubble: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
