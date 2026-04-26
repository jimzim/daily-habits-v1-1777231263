import { router } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AddHabitSheet, AddHabitSheetHandle } from '@/components/AddHabitSheet';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { HabitListEmpty } from '@/components/HabitListEmpty';
import { Skeleton, SkeletonRows } from '@/components/Skeleton';
import { SwipeableHabitRow } from '@/components/SwipeableHabitRow';
import { useHaptics } from '@/hooks/useHaptics';
import { useTheme } from '@/hooks/useTheme';
import { useHabits } from '@/stores/HabitsContext';
import { useToast } from '@/stores/ToastContext';
import type { Habit } from '@/db/types';
import { todayLocal } from '@/utils/date';
import { spacing, typography } from '@/theme';

const UNDO_DURATION_MS = 4000;

export default function TodayScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { habits, completions, ready, refresh, refreshing, toggleCompletion, archive, unarchive } = useHabits();
  const { show } = useToast();
  const haptics = useHaptics();
  const sheetRef = useRef<AddHabitSheetHandle>(null);

  const [pendingDelete, setPendingDelete] = useState<Habit | null>(null);

  const today = todayLocal();
  const completionByHabit = useMemo(() => {
    const m = new Map<string, true>();
    for (const c of completions) {
      if (c.date === today) m.set(c.habitId, true);
    }
    return m;
  }, [completions, today]);

  const sortedHabits = useMemo(() => {
    return [...habits].sort((a, b) => {
      const ac = completionByHabit.has(a.id) ? 1 : 0;
      const bc = completionByHabit.has(b.id) ? 1 : 0;
      if (ac !== bc) return ac - bc;
      return a.createdAt.localeCompare(b.createdAt);
    });
  }, [habits, completionByHabit]);

  const handleToggleComplete = useCallback(
    async (habit: Habit) => {
      const wasCompleted = completionByHabit.has(habit.id);
      haptics.impact(wasCompleted ? 'light' : 'medium');
      const nowCompleted = await toggleCompletion(habit.id);
      if (nowCompleted) {
        haptics.notify('success');
        show({ message: `${habit.icon} ${habit.name} completed`, variant: 'success' });
      } else {
        show({ message: `${habit.name} unchecked`, variant: 'info' });
      }
    },
    [completionByHabit, haptics, show, toggleCompletion]
  );

  const handleAdd = useCallback(() => {
    haptics.selection();
    sheetRef.current?.presentNew();
  }, [haptics]);

  const handleEdit = useCallback(
    (habit: Habit) => {
      haptics.selection();
      sheetRef.current?.presentEdit(habit);
    },
    [haptics]
  );

  const handlePressRow = useCallback((habit: Habit) => {
    router.push(`/habit/${habit.id}`);
  }, []);

  const handleRequestDelete = useCallback((habit: Habit) => {
    setPendingDelete(habit);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    const target = pendingDelete;
    if (!target) return;
    setPendingDelete(null);
    await archive(target.id);
    haptics.notify('warning');
    const undoToastId = show({
      message: `Habit deleted`,
      variant: 'undo',
      durationMs: UNDO_DURATION_MS,
      action: {
        label: 'Undo',
        onPress: () => {
          unarchive(target.id).catch(() => {});
          haptics.notify('success');
        },
      },
    });
    void undoToastId;
  }, [pendingDelete, archive, unarchive, haptics, show]);

  const handleCancelDelete = useCallback(() => setPendingDelete(null), []);

  const renderItem = useCallback(
    ({ item }: { item: Habit }) => (
      <SwipeableHabitRow
        habit={item}
        onPressRow={handlePressRow}
        onToggleComplete={handleToggleComplete}
        onPressEdit={handleEdit}
        onPressDelete={handleRequestDelete}
      />
    ),
    [handlePressRow, handleToggleComplete, handleEdit, handleRequestDelete]
  );

  const renderHeader = useCallback(
    () => (
      <View style={styles.headerWrap}>
        <Text style={[typography.h1, { color: theme.colors.textPrimary }]}>Today</Text>
        <Text style={[typography.body, { color: theme.colors.textMuted }]}>
          {dateHeading(today)}
        </Text>
      </View>
    ),
    [theme.colors, today]
  );

  if (!ready) {
    return (
      <View
        testID="today-screen-loading"
        style={[styles.screen, { backgroundColor: theme.colors.background, paddingTop: insets.top + spacing.lg }]}
      >
        <View style={styles.headerWrap}>
          <Skeleton width={120} height={28} radius={6} />
          <Skeleton width={200} height={18} radius={6} style={{ marginTop: 8 }} />
        </View>
        <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.lg }}>
          <SkeletonRows rows={4} rowHeight={72} />
        </View>
      </View>
    );
  }

  return (
    <View
      testID="today-screen"
      style={[styles.screen, { backgroundColor: theme.colors.background, paddingTop: insets.top }]}
    >
      <FlatList
        data={sortedHabits}
        keyExtractor={(h) => h.id}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={<HabitListEmpty onAddHabit={handleAdd} testID="today-empty" />}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingBottom: insets.bottom + 88,
            ...(sortedHabits.length === 0 ? { flexGrow: 1 } : null),
          },
        ]}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={theme.colors.primary}
            testID="today-refresh"
          />
        }
        showsVerticalScrollIndicator={false}
      />

      <Pressable
        testID="habit-add-fab"
        accessibilityRole="button"
        accessibilityLabel="Add new habit"
        onPress={handleAdd}
        style={({ pressed }) => [
          styles.fab,
          {
            backgroundColor: theme.colors.primary,
            bottom: insets.bottom + 24,
            transform: [{ scale: pressed ? 0.96 : 1 }],
          },
        ]}
      >
        <Text style={styles.fabIcon}>+</Text>
      </Pressable>

      <ConfirmDialog
        visible={pendingDelete !== null}
        title="Delete this habit?"
        message="Your streak history will be lost. You'll have 4 seconds to undo."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        destructive
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        testID="confirm-delete-habit"
      />

      <AddHabitSheet ref={sheetRef} />
    </View>
  );
}

function dateHeading(ymd: string): string {
  const [y, m, d] = ymd.split('-').map(Number);
  const date = new Date(y, (m ?? 1) - 1, d ?? 1);
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  headerWrap: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    gap: 4,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
  },
  fab: {
    position: 'absolute',
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  fabIcon: {
    color: '#fff',
    fontSize: 32,
    lineHeight: 34,
    fontWeight: '300',
  },
});
