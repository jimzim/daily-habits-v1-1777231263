# Daily Habits Tracker — Product Requirements Document

**Version:** 1.0 | 2026-04-26
**Platform:** React Native — Expo (iPhone, Android, web from one codebase)
**Purpose:** A polished daily habit tracker that proves scope-aware extract scales UP for apps that legitimately need UX polish. Multi-screen, persistent storage, full CRUD, gestures, and feedback throughout.

---

## Overview

A daily habit tracker for individuals who want to build consistent routines. Users define habits, mark them complete each day, see their streaks, and get a clear visual of their progress over time. Built in Expo for hybrid deployment (iOS + Android + web).

**Value prop:** A delightful, production-quality habit tracker that feels native on every platform — not a smoke test stub.

---

## Key Principles

1. **Mobile-first feel** — haptic feedback, swipe gestures, native bottom sheet
2. **Persistent local-first** — uses `expo-sqlite` so habits survive app restarts; no backend needed
3. **Visible streaks** — the user always knows their current run
4. **Polish matters** — empty states, loading skeletons, toast confirmations, undo on destructive actions
5. **Tri-target deploy** — same codebase ships to iOS, Android, AND Vercel-deployed web

---

## Brand Guidelines

### Color Palette
- **Primary:** `#6366F1` (indigo) — completion, primary actions
- **Success:** `#10B981` (emerald) — streaks, "completed" states
- **Warning:** `#F59E0B` (amber) — broken streaks, gentle prompts
- **Background:** `#F9FAFB` (light) / `#0F172A` (dark)
- **Card:** `#FFFFFF` (light) / `#1E293B` (dark)
- **Text primary:** `#111827` (light) / `#F1F5F9` (dark)
- **Text muted:** `#6B7280` (light) / `#94A3B8` (dark)

### Typography
- **Body:** System font, 400 weight, 16px base
- **Headings:** System font, 600 weight (H1: 28px, H2: 22px, H3: 18px)
- **Streak counter:** System font, 700 weight, 32px (display)

### Component Styles
- **Cards:** border-radius 12px, subtle shadow, 16px padding
- **Buttons:** Pill-shaped (border-radius 999px), 44pt min height
- **Touch targets:** 44pt minimum (iOS HIG / Android Material)

### Reference aesthetic
Think Streaks app on iOS or Habitify — clean, calm, single-screen-per-feature.

---

## User Stories

### Home Screen — Today's Habits
- As a user, I can **see today's habits** in a list with a completion checkbox each
  - [ ] Each row shows habit name, current streak (if >0), and a checkmark target
  - [ ] Tapping the checkmark marks the habit complete with a haptic tap and toast
  - [ ] Completed habits dim slightly and move to the bottom (sorted)
  - [ ] Empty state shows "Add your first habit" CTA when no habits exist
  - [ ] Pull-to-refresh re-syncs the day's state
  - [ ] FAB ("+" button) bottom-right opens the Add Habit sheet

### Add / Edit Habit Sheet
- As a user, I can **add a new habit** via a bottom sheet
  - [ ] Bottom sheet slides up from below (`@gorhom/bottom-sheet`)
  - [ ] Form fields: name (required), target frequency (daily / weekdays / 3x/week / 5x/week), icon picker, color picker
  - [ ] Save button is disabled until name is filled
  - [ ] Toast confirms "Habit added" on save
- As a user, I can **edit an existing habit** by tapping the row's edit button
  - [ ] Same bottom sheet, pre-populated with current values
  - [ ] Saving updates the habit and toasts "Habit updated"
- As a user, I can **delete a habit** by swiping the row left
  - [ ] Swipe reveals red "Delete" action
  - [ ] Confirmation dialog: "Delete this habit? Your streak history will be lost."
  - [ ] On confirm: toast "Habit deleted" with an "Undo" action that fires within 4 seconds
  - [ ] Undo restores the habit and its history

### Streak History — Detail View
- As a user, I can **tap a habit** to see its full history
  - [ ] Calendar grid for the current month with completion dots
  - [ ] Stats: current streak, longest streak, completion % this month, total completions
  - [ ] Skeleton loader appears while history loads (>200ms)
  - [ ] Back button returns to home

### Settings Screen
- As a user, I can **toggle dark mode** (system / light / dark)
  - [ ] Setting persists across app restarts
- As a user, I can **reset demo data** (drops SQLite, re-seeds sample habits)
  - [ ] Confirmation dialog warns about data loss
  - [ ] Toast confirms "Demo data reset"
- As a user, I can **see the about page** with version, privacy, and acknowledgments

---

## Features (MVP — 3 Phases)

### Phase 1: Core CRUD + Persistence
1. expo-sqlite database initialization with migrations
2. Habit data model + CRUD operations
3. Today's habits home screen with checkmarks
4. Add Habit bottom sheet
5. Mock data seeding on first launch

### Phase 2: Polish Layer
1. Toast notification system (success / error / info / undo)
2. Loading skeleton components for habit list and history view
3. Empty state component with illustration + CTA
4. Confirmation dialog component (destructive actions)
5. Bottom sheet wrapper component
6. Swipe-to-delete gesture (`react-native-gesture-handler`)
7. Pull-to-refresh on habit list (native `RefreshControl`)
8. Haptic feedback on key actions (`expo-haptics`)

### Phase 3: Detail + Settings
1. Habit detail / streak history screen with calendar
2. Settings screen (theme, reset demo, about)
3. Dark mode support (system + manual override)
4. App icons + splash screen branding

---

## Navigation Structure

### React Native (iOS + Android)
- **Bottom tab navigation:**
  - Today (default)
  - History (opens to overall stats)
  - Settings
- **Stack navigation:**
  - Today → Habit Detail (when row tapped)
- **Modals / Bottom Sheets:**
  - Add / Edit Habit (bottom sheet)
  - Delete Confirmation (alert dialog)
  - Reset Demo Data (alert dialog)

### Web
- Same routes via Expo Router (`app/(tabs)/today.tsx`, etc.)

---

## Data Models

```typescript
interface Habit {
  id: string;
  name: string;
  icon: string;            // emoji or icon name
  color: string;           // hex
  frequency: 'daily' | 'weekdays' | '3x_week' | '5x_week';
  createdAt: string;       // ISO timestamp
  updatedAt: string;
  archivedAt?: string;     // soft delete for undo
}

interface HabitCompletion {
  id: string;
  habitId: string;
  date: string;            // YYYY-MM-DD
  completedAt: string;     // ISO timestamp
}

interface UserPrefs {
  themeMode: 'system' | 'light' | 'dark';
  hapticsEnabled: boolean;
  demoDataSeeded: boolean;
}
```

### Relationships
- One Habit has many HabitCompletions (cascade delete via `archivedAt` soft-delete pattern, except when undo expires)

---

## Mock Data Requirements

| Entity | Count | Notes |
|---|---|---|
| Habits | 5 | "Drink water", "Read 20 min", "Walk 30 min", "Meditate", "No phone after 9pm" — varied icons + colors |
| HabitCompletions | ~80 | 30 days of history, distributed: 80% completion for "Drink water", 60% for "Read", 40% for "Walk", 50% for "Meditate", 30% for "No phone" — gives varied streak data |
| UserPrefs | 1 | system theme, haptics on, demoDataSeeded=true |

Mock data should produce visible streaks of varying lengths so the streak counter and color states are exercised.

---

## Project Structure

```
src/
  app/
    (tabs)/
      today.tsx          # Home screen
      history.tsx        # Stats overview
      settings.tsx       # Settings
      _layout.tsx        # Tab navigation
    habit/
      [id].tsx           # Detail screen with calendar
    _layout.tsx          # Root with theme + SafeAreaProvider
  components/
    HabitRow.tsx
    HabitListEmpty.tsx
    HabitDetailCalendar.tsx
    AddHabitSheet.tsx
    Toast.tsx
    ToastProvider.tsx
    Skeleton.tsx
    ConfirmDialog.tsx
    StreakBadge.tsx
  db/
    schema.ts            # SQLite schema + migrations
    habits.ts            # Habit CRUD
    completions.ts       # Completion CRUD + streak math
    seed.ts              # Mock data seeding
  hooks/
    useHabits.ts
    useStreak.ts
    useTheme.ts
    useHaptics.ts
  stores/
    PreferencesContext.tsx
    ToastContext.tsx
  utils/
    streak-math.ts       # Pure functions for streak/completion calculations
    date.ts              # YYYY-MM-DD helpers
```

---

## Technology Stack

- **Framework:** Expo SDK + Expo Router (TypeScript blank template)
- **Storage:** `expo-sqlite` for habits + completions; `AsyncStorage` for prefs
- **State:** React Context for prefs + toasts; local `useState` for screens
- **UI primitives:** React Native (`View`, `Text`, `Pressable`, `FlatList`)
- **Bottom sheet:** `@gorhom/bottom-sheet`
- **Gestures:** `react-native-gesture-handler` (swipe-to-delete)
- **Haptics:** `expo-haptics`
- **Web bridge:** `react-native-web`
- **Safe area:** `react-native-safe-area-context`
- **Native testing:** Maestro
- **Web testing:** Playwright
- **Web deploy:** Vercel

---

## Testing Requirements

### Maestro Flows (iOS)
1. **`add_habit_and_complete`** — Add a habit via FAB → bottom sheet → save → tap checkmark → see streak appear
2. **`swipe_to_delete_with_undo`** — Swipe a habit left → confirm delete → toast appears → tap undo → habit returns
3. **`navigate_to_detail`** — Tap a habit row → calendar visible → back navigation returns to home

### Playwright Flows (web)
1. **`counter_complete_habit`** — Add habit → complete it → assert streak count UI
2. **`empty_state_visible_with_no_habits`** — Reset demo data → verify empty state CTA shows

### Test ID Conventions
All interactive elements have BOTH `testID` (Maestro) AND `data-testid` (Playwright). Naming convention: `habit-row-${id}`, `habit-checkmark-${id}`, `habit-add-fab`, `habit-edit-button-${id}`, `toast-undo-action`, etc.

---

## Quality Requirements

- Touch targets: minimum 44pt iOS / 48dp Android / 44px web
- Safe area handling: notch on iOS, status bar on Android
- Accessibility: every interactive element has an `accessibilityLabel`
- Performance: habit list renders <200ms even with 50+ habits (FlatList with `keyExtractor`)
- Theme: dark mode toggle works across all screens, no flash of wrong theme on launch
- Persistence: kill the app, relaunch, all data survives
- Animation: completion check has a subtle spring animation; toast slides in from bottom

---

## Deployment

| Variant | Artifact | Deploy target |
|---|---|---|
| iOS | Expo iOS bundle | GitHub repo (TestFlight via EAS later — out of scope for this PRD) |
| Android | Expo Android bundle | GitHub repo (Play Console via EAS later — out of scope) |
| Web | `expo export --platform web` static export | Vercel preview URL |

For this build: iOS Maestro test on simulator, Playwright on web. Vercel deploy is the live shipping target. EAS distribution to TestFlight/Play Store is OUT OF SCOPE for v1.

---

## Success Criteria

- [ ] All Phase 1 + 2 + 3 features implemented per acceptance criteria
- [ ] Habits persist across app restarts (verified by killing app and relaunching)
- [ ] Mock data seeds on first launch with realistic streaks
- [ ] All 3 Maestro flows pass on iOS simulator
- [ ] All 2 Playwright flows pass on web build
- [ ] Vercel deploy succeeds and the web variant URL is reachable
- [ ] GitHub repo is created with the source code
- [ ] Step 6 build report includes BOTH Vercel URL AND GitHub repo URL
- [ ] Dark mode works without flash on app launch
- [ ] Swipe-to-delete + undo flow works end-to-end
- [ ] Empty state appears when no habits exist
- [ ] Skeleton loader appears on habit detail before calendar renders

---

## In Scope (DO add — this app needs polish)

- Toast notification system (success/error/info/undo variants)
- Loading skeletons for habit list and history view
- Empty state component with CTA
- Confirmation dialog for destructive actions
- Bottom sheet for add/edit (NOT a full-screen modal)
- Swipe-to-delete gesture with undo
- Pull-to-refresh
- Haptic feedback on completions, undos, and saves
- App icons + splash screen
- SQLite seed validation
- Reset Demo Data button in Settings

## Out of Scope (DO NOT add)

- TestFlight / Play Store distribution (no EAS submit tasks)
- Cloud sync / backend / auth (this is local-first only)
- Push notifications / reminders (would expand scope significantly — separate PRD later)
- Maestro Android Test Execution (focus iOS + web for v1; Android testing in a follow-up)

---

## Known Gotchas

**CRITICAL:** `react-native-safe-area-context` provider must wrap the root layout. Without `SafeAreaProvider`, `useSafeAreaInsets()` returns zeros.

**CRITICAL:** `react-native-web` must be in dependencies — without it, `expo export --platform web` fails.

**CRITICAL:** Vercel deploys the `dist/` static export, not the source repo.

**CRITICAL:** `@gorhom/bottom-sheet` requires `react-native-gesture-handler` and `react-native-reanimated` peer dependencies and must be wrapped at the root in `GestureHandlerRootView`.

**CRITICAL:** SQLite schema migrations must be idempotent — `CREATE TABLE IF NOT EXISTS`. The seed function should check `UserPrefs.demoDataSeeded` before inserting mock data to avoid duplicates on relaunch.

**CRITICAL:** Streak math should treat the day boundary in the user's local timezone, not UTC. Use `YYYY-MM-DD` strings derived from `new Date().toLocaleDateString('en-CA')`.

**CRITICAL:** Web variant must hide native-only features (haptics, gesture-based swipe-to-delete) gracefully via `Platform.OS !== 'web'` conditionals. The web variant should use a small "Delete" button on hover instead of swipe.

**CRITICAL:** When polling for `expo run:ios` readiness during Maestro test setup, use a bounded `until`-loop with a hard wall-clock cap, not `ScheduleWakeup`.