import { ReactNode } from 'react';
import { Platform, StyleSheet, View, ViewStyle } from 'react-native';
import { ThemeColors, elevation, radii, spacing } from '@/theme';

interface CardProps {
  children: ReactNode;
  colors: ThemeColors;
  scheme: 'light' | 'dark';
  padding?: keyof typeof spacing;
  style?: ViewStyle;
  testID?: string;
}

export function Card({ children, colors, scheme, padding = 'lg', style, testID }: CardProps) {
  return (
    <View
      testID={testID}
      style={[
        styles.base,
        {
          backgroundColor: colors.card,
          padding: spacing[padding],
          ...(scheme === 'dark' ? elevation.cardDark : elevation.cardLight),
          ...(Platform.OS === 'web'
            ? ({
                boxShadow:
                  scheme === 'dark'
                    ? '0 4px 12px rgba(0,0,0,0.5)'
                    : '0 2px 8px rgba(15,23,42,0.08)',
              } as ViewStyle)
            : {}),
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.card,
  },
});
