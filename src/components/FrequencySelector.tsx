import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ThemeColors, radii, spacing, typography } from '@/theme';
import type { Frequency } from '@/utils/streak-math';

interface FrequencySelectorProps {
  value: Frequency;
  onChange: (freq: Frequency) => void;
  colors: ThemeColors;
  testID?: string;
}

const OPTIONS: { value: Frequency; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekdays', label: 'Weekdays' },
  { value: '3x_week', label: '3x / week' },
  { value: '5x_week', label: '5x / week' },
];

export function FrequencySelector({ value, onChange, colors, testID }: FrequencySelectorProps) {
  return (
    <View
      testID={testID}
      style={styles.row}
    >
      {OPTIONS.map((opt) => {
        const selected = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            testID={`${testID ?? 'frequency'}-${opt.value}`}
            accessibilityRole="button"
            accessibilityLabel={`Set frequency to ${opt.label}`}
            accessibilityState={{ selected }}
            onPress={() => onChange(opt.value)}
            style={({ pressed }) => [
              styles.chip,
              {
                backgroundColor: selected ? colors.primary : colors.card,
                borderColor: selected ? colors.primary : colors.border,
              },
              pressed && { opacity: 0.85 },
            ]}
          >
            <Text
              style={[
                typography.caption,
                {
                  color: selected ? '#FFFFFF' : colors.textPrimary,
                  fontWeight: '600',
                },
              ]}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    minHeight: 44,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
