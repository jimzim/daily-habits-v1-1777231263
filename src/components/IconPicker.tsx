import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ThemeColors, radii, spacing } from '@/theme';

export const HABIT_ICONS = [
  '💧',
  '📖',
  '🚶',
  '🧘',
  '📵',
  '🥗',
  '💪',
  '😴',
  '🎯',
  '✍️',
  '🎵',
  '🌱',
] as const;

interface IconPickerProps {
  value: string;
  onChange: (icon: string) => void;
  colors: ThemeColors;
  testID?: string;
}

export function IconPicker({ value, onChange, colors, testID }: IconPickerProps) {
  return (
    <View
      testID={testID}
      style={styles.grid}
    >
      {HABIT_ICONS.map((icon) => {
        const selected = icon === value;
        return (
          <Pressable
            key={icon}
            testID={`${testID ?? 'icon-picker'}-${icon}`}
            accessibilityRole="button"
            accessibilityLabel={`Choose icon ${icon}`}
            accessibilityState={{ selected }}
            onPress={() => onChange(icon)}
            style={({ pressed }) => [
              styles.cell,
              {
                backgroundColor: selected ? colors.primary + '22' : colors.card,
                borderColor: selected ? colors.primary : colors.border,
              },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text style={styles.icon}>{icon}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  cell: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { fontSize: 24 },
});
