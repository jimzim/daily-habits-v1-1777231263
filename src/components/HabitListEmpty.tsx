import { EmptyState } from './EmptyState';

interface HabitListEmptyProps {
  onAddHabit: () => void;
  testID?: string;
}

export function HabitListEmpty({ onAddHabit, testID = 'habit-list-empty' }: HabitListEmptyProps) {
  return (
    <EmptyState
      testID={testID}
      icon="🌱"
      title="No habits yet"
      message="Track the small things that compound. Add your first habit to get started."
      ctaLabel="Add your first habit"
      onPressCta={onAddHabit}
    />
  );
}
