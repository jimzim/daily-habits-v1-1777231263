import { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { initializeSchema } from './schema';
import { WebDatabase } from './web-database';

export type Database = WebDatabase;

const DatabaseContext = createContext<Database | null>(null);

export function DatabaseProvider({ children }: { children: ReactNode }) {
  const [db] = useState(() => new WebDatabase());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    initializeSchema(db as any)
      .then(() => {
        if (!cancelled) setReady(true);
      })
      .catch((err) => {
        console.warn('[DatabaseProvider:web] init failed', err);
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [db]);

  if (!ready) return null;
  return <DatabaseContext.Provider value={db}>{children}</DatabaseContext.Provider>;
}

export function useDatabase(): Database {
  const db = useContext(DatabaseContext);
  if (!db) throw new Error('useDatabase must be used inside <DatabaseProvider>');
  return db;
}
