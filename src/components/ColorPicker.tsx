import { Pressable, StyleSheet, View } from 'react-native';
import { ThemeColors, habitPalette, radii, spacing } from '@/theme';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  colors: ThemeColors;
  testID?: string;
}

export function ColorPicker({ value, onChange, colors, testID }: ColorPickerProps) {
  return (
    <View
      testID={testID}
      style={styles.row}
    >
      {habitPalette.map((swatch) => {
        const selected = swatch.toLowerCase() === value.toLowerCase();
        return (
          <Pressable
            key={swatch}
            testID={`${testID ?? 'color-picker'}-${swatch.replace('#', '')}`}
            accessibilityRole="button"
            accessibilityLabel={`Choose color ${swatch}`}
            accessibilityState={{ selected }}
            onPress={() => onChange(swatch)}
            style={({ pressed }) => [
              styles.swatch,
              {
                backgroundColor: swatch,
                borderColor: selected ? colors.textPrimary : 'transparent',
              },
              pressed && { opacity: 0.7 },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  swatch: { width: 36, height: 36, borderRadius: radii.pill, borderWidth: 3 },
});
