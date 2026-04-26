import type { ReactNode } from 'react';
import type { SQLiteDatabase } from 'expo-sqlite';
import type { WebDatabase } from './web-database';

export type Database = SQLiteDatabase | WebDatabase;

export function DatabaseProvider(props: { children: ReactNode }): JSX.Element;
export function useDatabase(): Database;
