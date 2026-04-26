import { ReactNode, createContext, useContext } from 'react';
import {
  SQLiteProvider as NativeSQLiteProvider,
  useSQLiteContext as useNativeSQLiteContext,
  type SQLiteDatabase,
} from 'expo-sqlite';
import { DB_NAME, initializeSchema } from './schema';

export type Database = SQLiteDatabase;

const DatabaseContext = createContext<Database | null>(null);

function NativeBridge({ children }: { children: ReactNode }) {
  const db = useNativeSQLiteContext();
  return <DatabaseContext.Provider value={db}>{children}</DatabaseContext.Provider>;
}

export function DatabaseProvider({ children }: { children: ReactNode }) {
  return (
    <NativeSQLiteProvider databaseName={DB_NAME} onInit={initializeSchema}>
      <NativeBridge>{children}</NativeBridge>
    </NativeSQLiteProvider>
  );
}

export function useDatabase(): Database {
  const db = useContext(DatabaseContext);
  if (!db) throw new Error('useDatabase must be used inside <DatabaseProvider>');
  return db;
}
