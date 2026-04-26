import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { ThemeColors, palette, radii, TOUCH_TARGET, typography } from '@/theme';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  testID?: string;
  accessibilityLabel?: string;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  colors: ThemeColors;
  style?: ViewStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  testID,
  accessibilityLabel,
  iconLeft,
  iconRight,
  colors,
  style,
}: ButtonProps) {
  const sizeStyle = SIZES[size];
  const variantStyle = getVariantStyle(variant, colors, disabled);

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: disabled || loading }}
      onPress={disabled || loading ? undefined : onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        sizeStyle.container,
        variantStyle.container,
        pressed && !disabled && !loading && { opacity: 0.85, transform: [{ scale: 0.98 }] },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variantStyle.text.color} />
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          {iconLeft}
          <Text style={[sizeStyle.text, variantStyle.text]}>{title}</Text>
          {iconRight}
        </View>
      )}
    </Pressable>
  );
}

const SIZES: Record<ButtonSize, { container: ViewStyle; text: { fontSize: number; fontWeight: '600' } }> = {
  sm: { container: { minHeight: TOUCH_TARGET, paddingHorizontal: 14 }, text: { fontSize: 14, fontWeight: '600' } },
  md: { container: { minHeight: TOUCH_TARGET, paddingHorizontal: 18 }, text: { fontSize: 15, fontWeight: '600' } },
  lg: { container: { height: 52, paddingHorizontal: 24 }, text: { fontSize: 17, fontWeight: '600' } },
};

function getVariantStyle(variant: ButtonVariant, colors: ThemeColors, disabled: boolean) {
  if (disabled) {
    return {
      container: { backgroundColor: colors.border, borderWidth: 0 },
      text: { color: colors.textMuted, ...typography.bodyBold },
    };
  }
  switch (variant) {
    case 'primary':
      return {
        container: { backgroundColor: palette.primary, borderWidth: 0 },
        text: { color: '#FFFFFF', ...typography.bodyBold },
      };
    case 'secondary':
      return {
        container: { backgroundColor: 'transparent', borderColor: palette.primary, borderWidth: 1 },
        text: { color: palette.primary, ...typography.bodyBold },
      };
    case 'ghost':
      return {
        container: { backgroundColor: 'transparent', borderWidth: 0 },
        text: { color: palette.primary, ...typography.bodyBold },
      };
    case 'danger':
      return {
        container: { backgroundColor: palette.danger, borderWidth: 0 },
        text: { color: '#FFFFFF', ...typography.bodyBold },
      };
  }
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
});
