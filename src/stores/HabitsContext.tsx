import { useDatabase } from '@/db/DatabaseProvider';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  archiveHabit,
  createHabit,
  hardDeleteHabit,
  listHabits,
  unarchiveHabit,
  updateHabit,
} from '@/db/habits';
import {
  listAllCompletions,
  setCompleted as dbSetCompleted,
  toggleCompleted as dbToggleCompleted,
} from '@/db/completions';
import { reseedDemoData, seedDemoData } from '@/db/seed';
import type { Habit, HabitCompletion } from '@/db/types';
import type { Frequency } from '@/utils/streak-math';
import { todayLocal } from '@/utils/date';

interface HabitsState {
  habits: Habit[];
  completions: HabitCompletion[];
  ready: boolean;
  refreshing: boolean;
}

interface HabitsApi extends HabitsState {
  refresh: () => Promise<void>;
  add: (input: { name: string; icon: string; color: string; frequency: Frequency }) => Promise<Habit>;
  update: (
    id: string,
    input: { name?: string; icon?: string; color?: string; frequency?: Frequency }
  ) => Promise<Habit>;
  archive: (id: string) => Promise<void>;
  unarchive: (id: string) => Promise<void>;
  hardDelete: (id: string) => Promise<void>;
  toggleCompletion: (habitId: string, date?: string) => Promise<boolean>;
  setCompletion: (habitId: string, date: string, completed: boolean) => Promise<void>;
  resetDemo: () => Promise<void>;
}

const HabitsContext = createContext<HabitsApi | null>(null);

export function HabitsProvider({ children }: { children: ReactNode }) {
  const db = useDatabase() as any;
  const [state, setState] = useState<HabitsState>({
    habits: [],
    completions: [],
    ready: false,
    refreshing: false,
  });

  const reload = useCallback(async () => {
    const habits = await listHabits(db, false);
    const completions = await listAllCompletions(db);
    setState((prev) => ({ ...prev, habits, completions, ready: true }));
  }, [db]);

  const refresh = useCallback(async () => {
    setState((prev) => ({ ...prev, refreshing: true }));
    try {
      await reload();
    } finally {
      setState((prev) => ({ ...prev, refreshing: false }));
    }
  }, [reload]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await seedDemoData(db);
      if (cancelled) return;
      await reload();
    })().catch((err) => {
      console.warn('[HabitsContext] init failed', err);
    });
    return () => {
      cancelled = true;
    };
  }, [db, reload]);

  const add = useCallback<HabitsApi['add']>(
    async (input) => {
      const created = await createHabit(db, input);
      await reload();
      return created;
    },
    [db, reload]
  );

  const update = useCallback<HabitsApi['update']>(
    async (id, input) => {
      const updated = await updateHabit(db, id, input);
      await reload();
      return updated;
    },
    [db, reload]
  );

  const archive = useCallback(
    async (id: string) => {
      await archiveHabit(db, id);
      await reload();
    },
    [db, reload]
  );

  const unarchive = useCallback(
    async (id: string) => {
      await unarchiveHabit(db, id);
      await reload();
    },
    [db, reload]
  );

  const hardDelete = useCallback(
    async (id: string) => {
      await hardDeleteHabit(db, id);
      await reload();
    },
    [db, reload]
  );

  const toggleCompletion = useCallback(
    async (habitId: string, date: string = todayLocal()) => {
      const result = await dbToggleCompleted(db, habitId, date);
      await reload();
      return result;
    },
    [db, reload]
  );

  const setCompletion = useCallback(
    async (habitId: string, date: string, completed: boolean) => {
      await dbSetCompleted(db, habitId, date, completed);
      await reload();
    },
    [db, reload]
  );

  const resetDemo = useCallback(async () => {
    await reseedDemoData(db);
    await reload();
  }, [db, reload]);

  const value = useMemo<HabitsApi>(
    () => ({
      ...state,
      refresh,
      add,
      update,
      archive,
      unarchive,
      hardDelete,
      toggleCompletion,
      setCompletion,
      resetDemo,
    }),
    [state, refresh, add, update, archive, unarchive, hardDelete, toggleCompletion, setCompletion, resetDemo]
  );

  return <HabitsContext.Provider value={value}>{children}</HabitsContext.Provider>;
}

export function useHabits(): HabitsApi {
  const ctx = useContext(HabitsContext);
  if (!ctx) throw new Error('useHabits must be used inside <HabitsProvider>');
  return ctx;
}
