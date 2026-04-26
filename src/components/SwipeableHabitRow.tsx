import { useCallback } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  Gesture,
  GestureDetector,
  PanGestureHandlerEventPayload,
} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { HabitRow } from './HabitRow';
import type { Habit } from '@/db/types';
import { palette, radii, spacing, typography } from '@/theme';
import { useTheme } from '@/hooks/useTheme';

interface SwipeableHabitRowProps {
  habit: Habit;
  onPressRow?: (habit: Habit) => void;
  onToggleComplete?: (habit: Habit) => void;
  onPressEdit?: (habit: Habit) => void;
  onPressDelete?: (habit: Habit) => void;
}

const DELETE_WIDTH = 96;
const SWIPE_THRESHOLD = 80;

export function SwipeableHabitRow(props: SwipeableHabitRowProps) {
  const theme = useTheme();
  const translateX = useSharedValue(0);

  const reset = useCallback(() => {
    translateX.value = withSpring(0, { damping: 18, stiffness: 220 });
  }, [translateX]);

  const handleDelete = useCallback(() => {
    props.onPressDelete?.(props.habit);
    reset();
  }, [props, reset]);

  const pan = Gesture.Pan()
    .activeOffsetX([-12, 12])
    .failOffsetY([-10, 10])
    .onUpdate((e: PanGestureHandlerEventPayload) => {
      const next = Math.min(0, Math.max(-DELETE_WIDTH * 1.4, e.translationX));
      translateX.value = next;
    })
    .onEnd((e) => {
      if (e.translationX < -SWIPE_THRESHOLD) {
        translateX.value = withSpring(-DELETE_WIDTH, { damping: 18, stiffness: 220 });
      } else {
        translateX.value = withSpring(0, { damping: 18, stiffness: 220 });
      }
    });

  const rowAnim = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const deleteAnim = useAnimatedStyle(() => ({
    opacity: Math.min(1, Math.abs(translateX.value) / DELETE_WIDTH),
  }));

  if (Platform.OS === 'web') {
    return <HabitRow {...props} />;
  }

  return (
    <View style={styles.container}>
      <Animated.View
        pointerEvents="box-none"
        style={[styles.deleteAction, { backgroundColor: palette.danger }, deleteAnim]}
      >
        <Pressable
          testID={`habit-swipe-delete-${props.habit.id}`}
          accessibilityRole="button"
          accessibilityLabel={`Delete ${props.habit.name}`}
          onPress={handleDelete}
          style={styles.deletePressable}
          hitSlop={4}
        >
          <Text style={[typography.bodyBold, { color: '#fff' }]}>Delete</Text>
        </Pressable>
      </Animated.View>
      <GestureDetector gesture={pan}>
        <Animated.View
          style={[
            { backgroundColor: theme.colors.background, borderRadius: radii.card },
            rowAnim,
          ]}
        >
          <HabitRow {...props} />
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderRadius: radii.card,
  },
  deleteAction: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: DELETE_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.card,
    paddingHorizontal: spacing.md,
  },
  deletePressable: {
    flex: 1,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
