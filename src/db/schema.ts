import type { SQLiteDatabase } from 'expo-sqlite';

export const DB_NAME = 'daily-habits.db';
export const SCHEMA_VERSION = 1;

export async function initializeSchema(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(`PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;`);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS schema_meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS habits (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      icon TEXT NOT NULL,
      color TEXT NOT NULL,
      frequency TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      archived_at TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_habits_archived_at ON habits(archived_at);
    CREATE INDEX IF NOT EXISTS idx_habits_created_at ON habits(created_at);

    CREATE TABLE IF NOT EXISTS habit_completions (
      id TEXT PRIMARY KEY NOT NULL,
      habit_id TEXT NOT NULL,
      date TEXT NOT NULL,
      completed_at TEXT NOT NULL,
      UNIQUE(habit_id, date),
      FOREIGN KEY(habit_id) REFERENCES habits(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_completions_habit_id ON habit_completions(habit_id);
    CREATE INDEX IF NOT EXISTS idx_completions_date ON habit_completions(date);
  `);

  await db.runAsync(
    `INSERT OR IGNORE INTO schema_meta (key, value) VALUES (?, ?);`,
    'schema_version',
    String(SCHEMA_VERSION)
  );
}

export async function resetDatabase(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    DROP TABLE IF EXISTS habit_completions;
    DROP TABLE IF EXISTS habits;
    DROP TABLE IF EXISTS schema_meta;
  `);
  await initializeSchema(db);
}
