import { useMemo } from 'react';
import { useHabits } from '@/stores/HabitsContext';
import {
  currentStreak,
  Frequency,
  longestStreak,
  monthlyCompletionPct,
  totalCompletions,
} from '@/utils/streak-math';
import { addDays, monthRange, todayLocal } from '@/utils/date';

export interface HabitStats {
  current: number;
  longest: number;
  monthlyPct: number;
  total: number;
  datesByYmd: Set<string>;
}

export function useHabitStats(habitId: string, frequency: Frequency): HabitStats {
  const { completions } = useHabits();
  return useMemo(() => {
    const dates = new Set(
      completions.filter((c) => c.habitId === habitId).map((c) => c.date)
    );
    const today = todayLocal();
    const yearAgo = addDays(today, -365);
    const month = monthRange(today);
    return {
      current: currentStreak(dates, frequency, today),
      longest: longestStreak(dates, frequency, yearAgo, today),
      monthlyPct: monthlyCompletionPct(dates, frequency, month),
      total: totalCompletions(dates),
      datesByYmd: dates,
    };
  }, [completions, habitId, frequency]);
}

export function useCurrentStreak(habitId: string, frequency: Frequency): number {
  const { completions } = useHabits();
  return useMemo(() => {
    const dates = new Set(
      completions.filter((c) => c.habitId === habitId).map((c) => c.date)
    );
    return currentStreak(dates, frequency, todayLocal());
  }, [completions, habitId, frequency]);
}

export function useCompletedToday(habitId: string): boolean {
  const { completions } = useHabits();
  return useMemo(() => {
    const today = todayLocal();
    return completions.some((c) => c.habitId === habitId && c.date === today);
  }, [completions, habitId]);
}
