import type { Frequency } from '@/utils/streak-math';

export interface Habit {
  id: string;
  name: string;
  icon: string;
  color: string;
  frequency: Frequency;
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
}

export interface HabitCompletion {
  id: string;
  habitId: string;
  date: string;
  completedAt: string;
}

export interface HabitRow {
  id: string;
  name: string;
  icon: string;
  color: string;
  frequency: string;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
}

export interface CompletionRow {
  id: string;
  habit_id: string;
  date: string;
  completed_at: string;
}

export function rowToHabit(row: HabitRow): Habit {
  return {
    id: row.id,
    name: row.name,
    icon: row.icon,
    color: row.color,
    frequency: row.frequency as Frequency,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    archivedAt: row.archived_at,
  };
}

export function rowToCompletion(row: CompletionRow): HabitCompletion {
  return {
    id: row.id,
    habitId: row.habit_id,
    date: row.date,
    completedAt: row.completed_at,
  };
}
