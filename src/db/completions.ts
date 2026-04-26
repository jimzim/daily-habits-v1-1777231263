import type { SQLiteDatabase } from 'expo-sqlite';
import { CompletionRow, HabitCompletion, rowToCompletion } from './types';

function uid(): string {
  return `c_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export async function listCompletionsForHabit(
  db: SQLiteDatabase,
  habitId: string
): Promise<HabitCompletion[]> {
  const rows = await db.getAllAsync<CompletionRow>(
    `SELECT * FROM habit_completions WHERE habit_id = ? ORDER BY date DESC`,
    habitId
  );
  return rows.map(rowToCompletion);
}

export async function listCompletionsByDate(
  db: SQLiteDatabase,
  date: string
): Promise<HabitCompletion[]> {
  const rows = await db.getAllAsync<CompletionRow>(
    `SELECT * FROM habit_completions WHERE date = ?`,
    date
  );
  return rows.map(rowToCompletion);
}

export async function listAllCompletions(db: SQLiteDatabase): Promise<HabitCompletion[]> {
  const rows = await db.getAllAsync<CompletionRow>(
    `SELECT * FROM habit_completions ORDER BY date DESC`
  );
  return rows.map(rowToCompletion);
}

export async function isCompleted(
  db: SQLiteDatabase,
  habitId: string,
  date: string
): Promise<boolean> {
  const row = await db.getFirstAsync<{ id: string }>(
    `SELECT id FROM habit_completions WHERE habit_id = ? AND date = ?`,
    habitId,
    date
  );
  return row !== null;
}

export async function setCompleted(
  db: SQLiteDatabase,
  habitId: string,
  date: string,
  completed: boolean
): Promise<void> {
  if (completed) {
    const exists = await isCompleted(db, habitId, date);
    if (exists) return;
    await db.runAsync(
      `INSERT INTO habit_completions (id, habit_id, date, completed_at) VALUES (?, ?, ?, ?)`,
      uid(),
      habitId,
      date,
      new Date().toISOString()
    );
  } else {
    await db.runAsync(
      `DELETE FROM habit_completions WHERE habit_id = ? AND date = ?`,
      habitId,
      date
    );
  }
}

export async function toggleCompleted(
  db: SQLiteDatabase,
  habitId: string,
  date: string
): Promise<boolean> {
  const now = await isCompleted(db, habitId, date);
  await setCompleted(db, habitId, date, !now);
  return !now;
}

export async function deleteAllCompletionsForHabit(
  db: SQLiteDatabase,
  habitId: string
): Promise<void> {
  await db.runAsync(`DELETE FROM habit_completions WHERE habit_id = ?`, habitId);
}

export async function insertCompletionRaw(
  db: SQLiteDatabase,
  habitId: string,
  date: string,
  completedAt: string
): Promise<void> {
  await db.runAsync(
    `INSERT OR IGNORE INTO habit_completions (id, habit_id, date, completed_at) VALUES (?, ?, ?, ?)`,
    uid(),
    habitId,
    date,
    completedAt
  );
}
