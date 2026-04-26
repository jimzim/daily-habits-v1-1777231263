import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BottomSheet, BottomSheetHandle } from './BottomSheet';
import { Button } from './Button';
import { ColorPicker } from './ColorPicker';
import { FrequencySelector } from './FrequencySelector';
import { HABIT_ICONS, IconPicker } from './IconPicker';
import { Input } from './Input';
import { useTheme } from '@/hooks/useTheme';
import { useHabits } from '@/stores/HabitsContext';
import { useToast } from '@/stores/ToastContext';
import { useHaptics } from '@/hooks/useHaptics';
import type { Habit } from '@/db/types';
import type { Frequency } from '@/utils/streak-math';
import { habitPalette, spacing, typography } from '@/theme';

export interface AddHabitSheetHandle {
  presentNew: () => void;
  presentEdit: (habit: Habit) => void;
  dismiss: () => void;
}

interface DraftState {
  id: string | null;
  name: string;
  icon: string;
  color: string;
  frequency: Frequency;
}

const DEFAULT_DRAFT: DraftState = {
  id: null,
  name: '',
  icon: HABIT_ICONS[0],
  color: habitPalette[0],
  frequency: 'daily',
};

export const AddHabitSheet = forwardRef<AddHabitSheetHandle>(function AddHabitSheet(_, ref) {
  const sheetRef = useRef<BottomSheetHandle>(null);
  const theme = useTheme();
  const { add, update } = useHabits();
  const { show } = useToast();
  const haptics = useHaptics();
  const [draft, setDraft] = useState<DraftState>(DEFAULT_DRAFT);
  const [submitting, setSubmitting] = useState(false);

  useImperativeHandle(
    ref,
    () => ({
      presentNew: () => {
        setDraft(DEFAULT_DRAFT);
        sheetRef.current?.present();
      },
      presentEdit: (habit) => {
        setDraft({
          id: habit.id,
          name: habit.name,
          icon: habit.icon,
          color: habit.color,
          frequency: habit.frequency,
        });
        sheetRef.current?.present();
      },
      dismiss: () => sheetRef.current?.dismiss(),
    }),
    []
  );

  const isEditing = draft.id !== null;
  const canSave = draft.name.trim().length > 0 && !submitting;

  const handleSave = async () => {
    if (!canSave) return;
    setSubmitting(true);
    try {
      if (isEditing && draft.id) {
        await update(draft.id, {
          name: draft.name.trim(),
          icon: draft.icon,
          color: draft.color,
          frequency: draft.frequency,
        });
        haptics.notify('success');
        show({ message: 'Habit updated', variant: 'success' });
      } else {
        await add({
          name: draft.name.trim(),
          icon: draft.icon,
          color: draft.color,
          frequency: draft.frequency,
        });
        haptics.notify('success');
        show({ message: 'Habit added', variant: 'success' });
      }
      sheetRef.current?.dismiss();
    } catch (err) {
      console.warn('AddHabitSheet save failed', err);
      show({ message: 'Could not save habit', variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <BottomSheet
      ref={sheetRef}
      onDismiss={() => {
        // reset on next open by presenter
      }}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={Platform.OS !== 'web'}
      >
        <Text
          testID="add-habit-sheet-title"
          style={[typography.h2, { color: theme.colors.textPrimary }]}
        >
          {isEditing ? 'Edit habit' : 'New habit'}
        </Text>

        <Input
          colors={theme.colors}
          label="Name"
          placeholder="Drink water"
          value={draft.name}
          onChangeText={(name) => setDraft((d) => ({ ...d, name }))}
          maxLength={60}
          autoFocus={!isEditing}
          returnKeyType="done"
          onSubmitEditing={handleSave}
          testID="habit-name-input"
        />

        <View style={styles.section}>
          <Text style={[typography.caption, { color: theme.colors.textMuted }]}>Frequency</Text>
          <FrequencySelector
            value={draft.frequency}
            onChange={(frequency) => setDraft((d) => ({ ...d, frequency }))}
            colors={theme.colors}
            testID="habit-frequency"
          />
        </View>

        <View style={styles.section}>
          <Text style={[typography.caption, { color: theme.colors.textMuted }]}>Icon</Text>
          <IconPicker
            value={draft.icon}
            onChange={(icon) => setDraft((d) => ({ ...d, icon }))}
            colors={theme.colors}
            testID="habit-icon-picker"
          />
        </View>

        <View style={styles.section}>
          <Text style={[typography.caption, { color: theme.colors.textMuted }]}>Color</Text>
          <ColorPicker
            value={draft.color}
            onChange={(color) => setDraft((d) => ({ ...d, color }))}
            colors={theme.colors}
            testID="habit-color-picker"
          />
        </View>

        <View style={styles.actions}>
          <Button
            colors={theme.colors}
            title={isEditing ? 'Save changes' : 'Add habit'}
            onPress={handleSave}
            disabled={!canSave}
            loading={submitting}
            size="lg"
            testID="habit-save-button"
            style={{ alignSelf: 'stretch' }}
          />
        </View>
      </ScrollView>
    </BottomSheet>
  );
});

const styles = StyleSheet.create({
  content: { gap: spacing.lg, paddingBottom: spacing.xl },
  section: { gap: spacing.sm },
  actions: { marginTop: spacing.md, gap: spacing.sm },
});
