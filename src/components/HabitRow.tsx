import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { StreakBadge } from './StreakBadge';
import type { Habit } from '@/db/types';
import { useTheme } from '@/hooks/useTheme';
import { useCompletedToday, useCurrentStreak } from '@/hooks/useStreak';
import { radii, spacing, typography } from '@/theme';

interface HabitRowProps {
  habit: Habit;
  onPressRow?: (habit: Habit) => void;
  onToggleComplete?: (habit: Habit) => void;
  onPressEdit?: (habit: Habit) => void;
  onPressDelete?: (habit: Habit) => void;
}

export function HabitRow({
  habit,
  onPressRow,
  onToggleComplete,
  onPressEdit,
  onPressDelete,
}: HabitRowProps) {
  const theme = useTheme();
  const completed = useCompletedToday(habit.id);
  const streak = useCurrentStreak(habit.id, habit.frequency);

  const checkScale = useSharedValue(completed ? 1 : 0.6);
  const checkOpacity = useSharedValue(completed ? 1 : 0);
  const rowOpacity = useSharedValue(completed ? 0.55 : 1);

  useEffect(() => {
    checkScale.value = withSpring(completed ? 1 : 0.6, { damping: 12, stiffness: 220 });
    checkOpacity.value = withSpring(completed ? 1 : 0, { damping: 14, stiffness: 220 });
    rowOpacity.value = withSpring(completed ? 0.55 : 1, { damping: 16, stiffness: 240 });
  }, [completed, checkScale, checkOpacity, rowOpacity]);

  const checkAnim = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
    opacity: checkOpacity.value,
  }));

  const rowAnim = useAnimatedStyle(() => ({ opacity: rowOpacity.value }));

  return (
    <Animated.View
      testID={`habit-row-${habit.id}`}
      style={[
        styles.row,
        { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
        rowAnim,
      ]}
    >
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: completed }}
        accessibilityLabel={`${habit.name} ${completed ? 'completed' : 'mark complete'}`}
        testID={`habit-checkmark-${habit.id}`}
        onPress={() => onToggleComplete?.(habit)}
        hitSlop={8}
        style={({ pressed }) => [
          styles.check,
          {
            borderColor: completed ? habit.color : theme.colors.border,
            backgroundColor: completed ? habit.color : 'transparent',
          },
          pressed && { transform: [{ scale: 0.94 }] },
        ]}
      >
        <Animated.Text style={[styles.checkmark, checkAnim]} accessibilityElementsHidden>
          ✓
        </Animated.Text>
      </Pressable>

      <Pressable
        testID={`habit-row-pressable-${habit.id}`}
        accessibilityRole="button"
        accessibilityLabel={`Open ${habit.name} detail`}
        onPress={() => onPressRow?.(habit)}
        style={styles.bodyPressable}
      >
        <View style={styles.iconBlock}>
          <Text style={styles.icon}>{habit.icon}</Text>
        </View>
        <View style={styles.textBlock}>
          <Text
            numberOfLines={1}
            style={[
              typography.h3,
              {
                color: theme.colors.textPrimary,
                textDecorationLine: completed ? 'line-through' : 'none',
              },
            ]}
          >
            {habit.name}
          </Text>
          <Text style={[typography.caption, { color: theme.colors.textMuted }]}>
            {labelForFrequency(habit.frequency)}
          </Text>
        </View>
      </Pressable>

      <View style={styles.rightBlock}>
        {streak > 0 ? <StreakBadge count={streak} colors={theme.colors} /> : null}
        {onPressEdit ? (
          <Pressable
            testID={`habit-edit-button-${habit.id}`}
            accessibilityRole="button"
            accessibilityLabel={`Edit ${habit.name}`}
            onPress={() => onPressEdit(habit)}
            hitSlop={8}
            style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.6 }]}
          >
            <Text style={{ fontSize: 18 }}>✏️</Text>
          </Pressable>
        ) : null}
        {onPressDelete && Platform.OS === 'web' ? (
          <Pressable
            testID={`habit-delete-button-${habit.id}`}
            accessibilityRole="button"
            accessibilityLabel={`Delete ${habit.name}`}
            onPress={() => onPressDelete(habit)}
            hitSlop={8}
            style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.6 }]}
          >
            <Text style={{ fontSize: 18 }}>🗑️</Text>
          </Pressable>
        ) : null}
      </View>
    </Animated.View>
  );
}

function labelForFrequency(frequency: Habit['frequency']) {
  switch (frequency) {
    case 'daily':
      return 'Daily';
    case 'weekdays':
      return 'Weekdays';
    case '3x_week':
      return '3x / week';
    case '5x_week':
      return '5x / week';
  }
}

const styles = StyleSheet.create({
  row: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.md,
    borderRadius: radii.card,
    borderWidth: 1,
  },
  check: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 20,
  },
  bodyPressable: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 44,
  },
  iconBlock: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.04)',
  },
  icon: { fontSize: 22 },
  textBlock: { flex: 1, gap: 2 },
  rightBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconBtn: {
    minWidth: 36,
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
