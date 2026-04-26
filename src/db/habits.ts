import type { SQLiteDatabase } from 'expo-sqlite';
import { Habit, HabitRow, rowToHabit } from './types';
import type { Frequency } from '@/utils/streak-math';

function uid(): string {
  return `h_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export interface NewHabitInput {
  name: string;
  icon: string;
  color: string;
  frequency: Frequency;
}

export interface UpdateHabitInput {
  name?: string;
  icon?: string;
  color?: string;
  frequency?: Frequency;
}

export async function listHabits(db: SQLiteDatabase, includeArchived = false): Promise<Habit[]> {
  const rows = await db.getAllAsync<HabitRow>(
    includeArchived
      ? `SELECT * FROM habits ORDER BY datetime(created_at) ASC`
      : `SELECT * FROM habits WHERE archived_at IS NULL ORDER BY datetime(created_at) ASC`
  );
  return rows.map(rowToHabit);
}

export async function getHabit(db: SQLiteDatabase, id: string): Promise<Habit | null> {
  const row = await db.getFirstAsync<HabitRow>(`SELECT * FROM habits WHERE id = ?`, id);
  return row ? rowToHabit(row) : null;
}

export async function createHabit(db: SQLiteDatabase, input: NewHabitInput): Promise<Habit> {
  const now = new Date().toISOString();
  const id = uid();
  await db.runAsync(
    `INSERT INTO habits (id, name, icon, color, frequency, created_at, updated_at, archived_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, NULL)`,
    id,
    input.name,
    input.icon,
    input.color,
    input.frequency,
    now,
    now
  );
  const created = await getHabit(db, id);
  if (!created) throw new Error('createHabit: row not found after insert');
  return created;
}

export async function updateHabit(
  db: SQLiteDatabase,
  id: string,
  input: UpdateHabitInput
): Promise<Habit> {
  const now = new Date().toISOString();
  const fields: string[] = [];
  const values: (string | null)[] = [];
  if (input.name !== undefined) { fields.push('name = ?'); values.push(input.name); }
  if (input.icon !== undefined) { fields.push('icon = ?'); values.push(input.icon); }
  if (input.color !== undefined) { fields.push('color = ?'); values.push(input.color); }
  if (input.frequency !== undefined) { fields.push('frequency = ?'); values.push(input.frequency); }
  fields.push('updated_at = ?');
  values.push(now);
  values.push(id);
  await db.runAsync(`UPDATE habits SET ${fields.join(', ')} WHERE id = ?`, ...values);
  const updated = await getHabit(db, id);
  if (!updated) throw new Error('updateHabit: row not found');
  return updated;
}

export async function archiveHabit(db: SQLiteDatabase, id: string): Promise<void> {
  const now = new Date().toISOString();
  await db.runAsync(`UPDATE habits SET archived_at = ?, updated_at = ? WHERE id = ?`, now, now, id);
}

export async function unarchiveHabit(db: SQLiteDatabase, id: string): Promise<void> {
  const now = new Date().toISOString();
  await db.runAsync(
    `UPDATE habits SET archived_at = NULL, updated_at = ? WHERE id = ?`,
    now,
    id
  );
}

export async function hardDeleteHabit(db: SQLiteDatabase, id: string): Promise<void> {
  await db.runAsync(`DELETE FROM habits WHERE id = ?`, id);
}
