import type { SQLiteDatabase } from 'expo-sqlite';
import { addDays, todayLocal } from '@/utils/date';
import type { Frequency } from '@/utils/streak-math';
import { createHabit } from './habits';
import { insertCompletionRaw } from './completions';

interface SeedSpec {
  name: string;
  icon: string;
  color: string;
  frequency: Frequency;
  completionRate: number;
}

const SEED_HABITS: SeedSpec[] = [
  { name: 'Drink water',        icon: '💧', color: '#3B82F6', frequency: 'daily',    completionRate: 0.8 },
  { name: 'Read 20 min',        icon: '📖', color: '#8B5CF6', frequency: 'daily',    completionRate: 0.6 },
  { name: 'Walk 30 min',        icon: '🚶', color: '#10B981', frequency: 'daily',    completionRate: 0.4 },
  { name: 'Meditate',           icon: '🧘', color: '#F59E0B', frequency: 'daily',    completionRate: 0.5 },
  { name: 'No phone after 9pm', icon: '📵', color: '#EF4444', frequency: 'weekdays', completionRate: 0.3 },
];

function pseudoRandom(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return (s & 0x7fffffff) / 0x7fffffff;
  };
}

export async function isSeeded(db: SQLiteDatabase): Promise<boolean> {
  const row = await db.getFirstAsync<{ value: string }>(
    `SELECT value FROM schema_meta WHERE key = 'demoDataSeeded'`
  );
  return row?.value === 'true';
}

export async function markSeeded(db: SQLiteDatabase, value: boolean): Promise<void> {
  await db.runAsync(
    `INSERT INTO schema_meta (key, value) VALUES ('demoDataSeeded', ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    value ? 'true' : 'false'
  );
}

export async function seedDemoData(db: SQLiteDatabase): Promise<void> {
  if (await isSeeded(db)) return;
  const today = todayLocal();
  const rng = pseudoRandom(42);

  for (let h = 0; h < SEED_HABITS.length; h++) {
    const spec = SEED_HABITS[h];
    const habit = await createHabit(db, {
      name: spec.name,
      icon: spec.icon,
      color: spec.color,
      frequency: spec.frequency,
    });
    for (let i = 1; i <= 30; i++) {
      const date = addDays(today, -i);
      if (rng() < spec.completionRate) {
        const completedAt = new Date(`${date}T18:00:00`).toISOString();
        await insertCompletionRaw(db, habit.id, date, completedAt);
      }
    }
  }
  await markSeeded(db, true);
}

export async function reseedDemoData(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(`DELETE FROM habit_completions; DELETE FROM habits;`);
  await markSeeded(db, false);
  await seedDemoData(db);
}
