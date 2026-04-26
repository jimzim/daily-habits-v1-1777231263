import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { useToast } from '@/stores/ToastContext';
import { palette, radii, spacing, typography } from '@/theme';

const VARIANT_COLORS: Record<string, string> = {
  success: palette.success,
  error: palette.danger,
  info: palette.primary,
  undo: palette.warning,
};

export function ToastViewport() {
  const { current, dismiss } = useToast();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const visible = current !== null;
  const translateY = useSharedValue(120);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, { damping: 15, stiffness: 220 });
      opacity.value = withTiming(1, { duration: 200 });
    } else {
      translateY.value = withTiming(120, { duration: 220 });
      opacity.value = withTiming(0, { duration: 180 });
    }
  }, [visible, translateY, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (!current) {
    return (
      <Animated.View
        pointerEvents="none"
        style={[styles.root, { bottom: insets.bottom + 16 }, animatedStyle]}
      />
    );
  }

  const accent = VARIANT_COLORS[current.variant] ?? theme.colors.primary;

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[styles.root, { bottom: insets.bottom + 16 }, animatedStyle]}
    >
      <View
        testID={`toast-${current.variant}`}
        style={[
          styles.bubble,
          {
            backgroundColor: theme.colors.card,
            borderColor: accent,
          },
        ]}
      >
        <View style={[styles.dot, { backgroundColor: accent }]} />
        <Text
          testID="toast-message"
          style={[typography.body, { color: theme.colors.textPrimary, flex: 1 }]}
          numberOfLines={2}
        >
          {current.message}
        </Text>
        {current.action ? (
          <Pressable
            testID="toast-undo-action"
            accessibilityRole="button"
            accessibilityLabel={current.action.label}
            onPress={() => {
              current.action?.onPress();
              dismiss(current.id);
            }}
            style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.7 }]}
          >
            <Text style={[typography.bodyBold, { color: accent }]}>
              {current.action.label}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    left: 16,
    right: 16,
    alignItems: 'center',
  },
  bubble: {
    width: '100%',
    maxWidth: 480,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.card,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  actionBtn: {
    minHeight: 40,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
    borderRadius: radii.pill,
  },
});
