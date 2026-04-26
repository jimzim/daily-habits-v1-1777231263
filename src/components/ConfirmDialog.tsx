import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Button } from './Button';
import { useTheme } from '@/hooks/useTheme';
import { radii, spacing, typography } from '@/theme';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  testID?: string;
}

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  onConfirm,
  onCancel,
  testID,
}: ConfirmDialogProps) {
  const theme = useTheme();
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
      statusBarTranslucent
    >
      <Pressable
        accessibilityLabel="Close dialog"
        onPress={onCancel}
        style={[styles.overlay, { backgroundColor: theme.colors.overlay }]}
      >
        <Pressable
          testID={testID}
          onPress={() => {
            // swallow taps inside the dialog
          }}
          style={[styles.dialog, { backgroundColor: theme.colors.card }]}
        >
          <Text
            testID={`${testID ?? 'confirm'}-title`}
            style={[typography.h3, { color: theme.colors.textPrimary }]}
          >
            {title}
          </Text>
          {message ? (
            <Text
              testID={`${testID ?? 'confirm'}-message`}
              style={[
                typography.body,
                { color: theme.colors.textMuted, marginTop: spacing.sm },
              ]}
            >
              {message}
            </Text>
          ) : null}
          <View style={styles.actions}>
            <Button
              colors={theme.colors}
              variant="ghost"
              title={cancelLabel}
              onPress={onCancel}
              testID={`${testID ?? 'confirm'}-cancel`}
              size="md"
            />
            <Button
              colors={theme.colors}
              variant={destructive ? 'danger' : 'primary'}
              title={confirmLabel}
              onPress={onConfirm}
              testID={`${testID ?? 'confirm'}-confirm`}
              size="md"
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  dialog: {
    width: '100%',
    maxWidth: 420,
    borderRadius: radii.card,
    padding: spacing.xl,
    gap: spacing.md,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
});
