import { useEffect } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';
import { radii } from '@/theme';

interface SkeletonProps {
  width?: number | `${number}%`;
  height?: number;
  radius?: number;
  style?: ViewStyle;
  testID?: string;
}

export function Skeleton({ width, height = 16, radius = 8, style, testID }: SkeletonProps) {
  const theme = useTheme();
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.85, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    return () => cancelAnimation(opacity);
  }, [opacity]);

  const animated = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <View
      testID={testID}
      style={[
        styles.base,
        {
          width: width ?? '100%',
          height,
          borderRadius: radius,
          backgroundColor: theme.colors.border,
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          StyleSheet.absoluteFillObject,
          { backgroundColor: theme.colors.cardElevated, borderRadius: radius },
          animated,
        ]}
      />
    </View>
  );
}

interface SkeletonRowProps {
  rows?: number;
  rowHeight?: number;
  gap?: number;
  testID?: string;
}

export function SkeletonRows({ rows = 3, rowHeight = 60, gap = 12, testID }: SkeletonRowProps) {
  return (
    <View testID={testID} style={{ gap }}>
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} height={rowHeight} radius={radii.card} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
  },
});
