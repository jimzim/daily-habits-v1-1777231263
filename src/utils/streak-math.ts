import { addDays, dayOfWeek, isWeekday, todayLocal } from './date';

export type Frequency = 'daily' | 'weekdays' | '3x_week' | '5x_week';

export function isExpectedOn(frequency: Frequency, ymd: string): boolean {
  switch (frequency) {
    case 'daily':
      return true;
    case 'weekdays':
      return isWeekday(ymd);
    case '3x_week': {
      const dow = dayOfWeek(ymd);
      return dow === 1 || dow === 3 || dow === 5;
    }
    case '5x_week':
      return isWeekday(ymd);
  }
}

export function targetPerWeek(frequency: Frequency): number {
  switch (frequency) {
    case 'daily':
      return 7;
    case 'weekdays':
    case '5x_week':
      return 5;
    case '3x_week':
      return 3;
  }
}

export function currentStreak(
  completionsByDate: ReadonlySet<string>,
  frequency: Frequency,
  anchor: string = todayLocal()
): number {
  let streak = 0;
  let cursor = anchor;
  for (let safety = 0; safety < 365 * 3; safety++) {
    if (!isExpectedOn(frequency, cursor)) {
      cursor = addDays(cursor, -1);
      continue;
    }
    if (completionsByDate.has(cursor)) {
      streak += 1;
      cursor = addDays(cursor, -1);
    } else {
      break;
    }
  }
  return streak;
}

export function longestStreak(
  completionsByDate: ReadonlySet<string>,
  frequency: Frequency,
  start: string,
  end: string
): number {
  let cursor = start;
  let best = 0;
  let run = 0;
  let safety = 0;
  while (cursor <= end && safety < 365 * 5) {
    safety += 1;
    if (!isExpectedOn(frequency, cursor)) {
      cursor = addDays(cursor, 1);
      continue;
    }
    if (completionsByDate.has(cursor)) {
      run += 1;
      best = Math.max(best, run);
    } else {
      run = 0;
    }
    cursor = addDays(cursor, 1);
  }
  return best;
}

export function monthlyCompletionPct(
  completionsByDate: ReadonlySet<string>,
  frequency: Frequency,
  monthDays: readonly string[]
): number {
  const expected = monthDays.filter((d) => isExpectedOn(frequency, d));
  if (expected.length === 0) return 0;
  const done = expected.filter((d) => completionsByDate.has(d)).length;
  return Math.round((done / expected.length) * 100);
}

export function totalCompletions(completionsByDate: ReadonlySet<string>): number {
  return completionsByDate.size;
}
