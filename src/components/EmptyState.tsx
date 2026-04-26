import { StyleSheet, Text, View } from 'react-native';
import { Button } from './Button';
import { useTheme } from '@/hooks/useTheme';
import { spacing, typography } from '@/theme';

interface EmptyStateProps {
  icon?: string;
  title: string;
  message?: string;
  ctaLabel?: string;
  onPressCta?: () => void;
  testID?: string;
}

export function EmptyState({
  icon = '🌱',
  title,
  message,
  ctaLabel,
  onPressCta,
  testID,
}: EmptyStateProps) {
  const theme = useTheme();
  return (
    <View
      testID={testID}
      style={styles.container}
      accessibilityLabel={title}
    >
      <Text style={styles.icon}>{icon}</Text>
      <Text style={[typography.h2, { color: theme.colors.textPrimary, textAlign: 'center' }]}>
        {title}
      </Text>
      {message ? (
        <Text
          style={[
            typography.body,
            { color: theme.colors.textMuted, textAlign: 'center', maxWidth: 320 },
          ]}
        >
          {message}
        </Text>
      ) : null}
      {ctaLabel && onPressCta ? (
        <Button
          colors={theme.colors}
          title={ctaLabel}
          onPress={onPressCta}
          variant="primary"
          size="lg"
          testID={`${testID ?? 'empty-state'}-cta`}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  icon: {
    fontSize: 64,
  },
});
