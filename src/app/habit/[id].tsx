import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HabitDetailCalendar } from '@/components/HabitDetailCalendar';
import { HabitDetailStats } from '@/components/HabitDetailStats';
import { Skeleton, SkeletonRows } from '@/components/Skeleton';
import { StreakBadge } from '@/components/StreakBadge';
import { useTheme } from '@/hooks/useTheme';
import { useHabitStats } from '@/hooks/useStreak';
import { useHabits } from '@/stores/HabitsContext';
import { spacing, typography } from '@/theme';

const SKELETON_DELAY_MS = 200;

export default function HabitDetailScreen() {
  const params = useLocalSearchParams();
  const id = Array.isArray(params.id) ? params.id[0] : (params.id as string | undefined);
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { habits, ready } = useHabits();

  const habit = habits.find((h) => h.id === id);
  const stats = useHabitStats(id ?? '', habit?.frequency ?? 'daily');

  const [showSkeleton, setShowSkeleton] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setShowSkeleton(false), SKELETON_DELAY_MS);
    return () => clearTimeout(t);
  }, []);

  const calendarBody = useMemo(() => {
    if (!habit) return null;
    return (
      <HabitDetailCalendar
        habitColor={habit.color}
        frequency={habit.frequency}
        completedDates={stats.datesByYmd}
      />
    );
  }, [habit, stats.datesByYmd]);

  if (!ready || showSkeleton) {
    return (
      <ScrollView
        testID="habit-detail-loading"
        style={{ flex: 1, backgroundColor: theme.colors.background }}
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg, paddingTop: spacing.lg }}
      >
        <Stack.Screen options={{ headerTitle: 'Habit' }} />
        <Skeleton width={180} height={28} radius={8} />
        <Skeleton height={88} radius={12} />
        <SkeletonRows rows={2} rowHeight={80} />
      </ScrollView>
    );
  }

  if (!habit) {
    return (
      <View
        testID="habit-detail-missing"
        style={[styles.center, { backgroundColor: theme.colors.background }]}
      >
        <Stack.Screen options={{ headerTitle: 'Habit' }} />
        <Text style={[typography.h2, { color: theme.colors.textPrimary }]}>Habit not found</Text>
        <Text style={[typography.body, { color: theme.colors.textMuted }]}>
          It may have been deleted.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      testID="habit-detail"
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={{
        padding: spacing.lg,
        paddingBottom: insets.bottom + spacing.xl,
        gap: spacing.lg,
      }}
    >
      <Stack.Screen options={{ headerTitle: habit.name }} />
      <View style={styles.headerCard}>
        <View
          style={[
            styles.iconBubble,
            { backgroundColor: habit.color + '22', borderColor: habit.color },
          ]}
        >
          <Text style={{ fontSize: 32 }}>{habit.icon}</Text>
        </View>
        <View style={{ flex: 1, gap: 6 }}>
          <Text style={[typography.h2, { color: theme.colors.textPrimary }]}>{habit.name}</Text>
          <Text style={[typography.caption, { color: theme.colors.textMuted }]}>
            {labelForFrequency(habit.frequency)}
          </Text>
          {stats.current > 0 ? <StreakBadge count={stats.current} colors={theme.colors} size="md" /> : null}
        </View>
      </View>

      <HabitDetailStats
        current={stats.current}
        longest={stats.longest}
        monthlyPct={stats.monthlyPct}
        total={stats.total}
      />

      {calendarBody}
    </ScrollView>
  );
}

function labelForFrequency(frequency: string) {
  switch (frequency) {
    case 'daily':
      return 'Daily';
    case 'weekdays':
      return 'Weekdays';
    case '3x_week':
      return '3x / week';
    case '5x_week':
      return '5x / week';
    default:
      return frequency;
  }
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  headerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
  },
  iconBubble: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
