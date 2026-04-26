import { forwardRef } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import { ThemeColors, radii, spacing, typography } from '@/theme';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  colors: ThemeColors;
  containerStyle?: ViewStyle;
  testID?: string;
}

export const Input = forwardRef<TextInput, InputProps>(function Input(
  { label, error, colors, containerStyle, testID, ...rest },
  ref
) {
  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <Text style={[typography.caption, { color: colors.textMuted, marginBottom: spacing.xs }]}>{label}</Text> : null}
      <TextInput
        ref={ref}
        testID={testID}
        placeholderTextColor={colors.textMuted}
        style={[
          styles.input,
          {
            backgroundColor: colors.card,
            borderColor: error ? colors.danger : colors.border,
            color: colors.textPrimary,
          },
        ]}
        {...rest}
      />
      {error ? (
        <Text style={[typography.small, { color: colors.danger, marginTop: spacing.xs }]}>{error}</Text>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  container: { width: '100%' },
  input: {
    minHeight: 48,
    borderRadius: radii.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...typography.body,
  },
});
