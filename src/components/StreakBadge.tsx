import { StyleSheet, Text, View } from 'react-native';
import { ThemeColors, palette, radii, spacing, typography } from '@/theme';

interface StreakBadgeProps {
  count: number;
  size?: 'sm' | 'md' | 'lg';
  colors: ThemeColors;
  testID?: string;
}

export function StreakBadge({ count, size = 'sm', colors, testID }: StreakBadgeProps) {
  if (count <= 0) return null;
  const tone = count >= 7 ? palette.success : count >= 3 ? palette.warning : colors.textMuted;
  const fontSize = size === 'lg' ? 18 : size === 'md' ? 14 : 12;
  const padV = size === 'lg' ? 6 : 3;
  const padH = size === 'lg' ? 12 : 8;
  return (
    <View
      testID={testID}
      accessibilityLabel={`Streak ${count} days`}
      style={[
        styles.badge,
        { backgroundColor: tone + '20', paddingHorizontal: padH, paddingVertical: padV },
      ]}
    >
      <Text style={[typography.bodyBold, { color: tone, fontSize, lineHeight: fontSize + 4 }]}>
        🔥 {count}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radii.pill,
    alignSelf: 'flex-start',
    gap: spacing.xs,
  },
});
