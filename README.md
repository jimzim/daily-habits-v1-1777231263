# Daily Habits

A polished daily habit tracker built with Expo Router. Ships from one TypeScript codebase to **iOS**, **Android**, and **web** (deployed to Vercel).

## Highlights

- Local-first storage via `expo-sqlite` — habits and completion history persist offline, no backend.
- Five seeded demo habits with 30 days of varied completion history so streaks, monthly %, and longest-run all show realistic values.
- Add / edit / delete via a `@gorhom/bottom-sheet` form with icon picker, color picker, and frequency selector.
- Swipe-left-to-delete on iOS / Android via `react-native-gesture-handler`; web shows a Delete button per row.
- 4-second undo toast on delete (soft archive then unarchive).
- Habit detail with stats panel (current streak, longest streak, monthly %, total) plus a calendar grid.
- Light + dark theme with system / manual override; no flash on launch.
- Pull-to-refresh, haptic feedback (`expo-haptics` on native, no-op on web), `SafeAreaProvider` on every screen.
- Maestro flows (iOS) and Playwright specs (web) sharing the same `testID` / `data-testid` strings.

## Stack

| Layer | Choice |
|---|---|
| Framework | Expo SDK 52, Expo Router v4, TypeScript strict |
| Storage | `expo-sqlite` + `@react-native-async-storage/async-storage` |
| Bottom sheet | `@gorhom/bottom-sheet` |
| Gestures | `react-native-gesture-handler` |
| Animation | `react-native-reanimated` 3 |
| Haptics | `expo-haptics` |
| Web bridge | `react-native-web` |
| Native testing | Maestro (iOS) |
| Web testing | Playwright |
| Web deploy | Vercel (`vercel deploy dist/ --prod`) |

## Project layout

```
src/
  app/              # Expo Router (file-based)
    (tabs)/
      index.tsx     # Today
      history.tsx   # History overview
      settings.tsx  # Settings
      _layout.tsx
    habit/[id].tsx  # Detail view
    about.tsx       # Modal
    _layout.tsx     # Root providers (Gesture, SafeArea, SQLite, Toast, Habits, BottomSheetModal)
  components/       # Button, Card, Input, Toast, Skeleton, ConfirmDialog, BottomSheet, HabitRow, ...
  db/               # schema.ts, habits.ts, completions.ts, seed.ts, types.ts
  hooks/            # useTheme, useHaptics, useHabits, useStreak
  stores/           # PreferencesContext, ToastContext, HabitsContext
  theme/            # colors, typography, spacing, radii, elevation
  utils/            # date.ts (local-tz YYYY-MM-DD), streak-math.ts
.maestro/           # iOS Maestro flows
e2e/tests/          # Playwright specs
```

## Scripts

```bash
npm install
npm run start          # Metro dev server
npm run ios            # iOS simulator (run after `npx expo prebuild --clean && cd ios && pod install`)
npm run android        # Android emulator
npm run web            # Expo web dev server (http://localhost:8081)
npm run typecheck      # tsc --noEmit
npm run lint           # eslint . --ext .ts,.tsx

# Build artifacts
npx expo export --platform web                 # writes dist/

# Tests
maestro test -p ios .maestro/                  # Native (iOS) e2e
npx playwright test                             # Web e2e

# Deployment
vercel deploy dist/ --prod                     # Web → Vercel
```

## First-time iOS setup (development)

```bash
npm install
npx expo prebuild --clean
cd ios && pod install && cd ..

# Build via xcodebuild (avoids `expo run:ios`'s code-sign quirk on simulators)
cd ios && xcodebuild \
  -workspace DailyHabits.xcworkspace \
  -scheme DailyHabits \
  -configuration Debug \
  -destination "platform=iOS Simulator,name=iPhone 17" \
  -derivedDataPath build \
  build
xcrun simctl install booted ios/build/Build/Products/Debug-iphonesimulator/DailyHabits.app
xcrun simctl launch booted com.dailyhabits.app
```

After the first build, subsequent JS-only changes only need Metro:

```bash
npx expo start --port 8081
```

> ⚠️ **fmt + Xcode 26**: the Podfile patches `fmt`'s `base.h` so the compiler honors `FMT_USE_CONSTEVAL=0`. This works around an Xcode 26 strict consteval enforcement that breaks vanilla RN 0.76 pods. The patch re-applies on every `pod install`.

## Web cross-origin isolation

`expo-sqlite` on web depends on `SharedArrayBuffer`, which requires the page to be cross-origin isolated. Two pieces:

- `metro.config.js` adds `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp` to every Metro response.
- `vercel.json` sends the same headers from production.

Without these, the web build silently fails to load habits.

## Architecture notes

- **Streak math** lives in pure functions (`utils/streak-math.ts`) and is timezone-safe via `toLocaleDateString('en-CA')` (`YYYY-MM-DD`).
- **Mock data** seeds exactly once, gated on a `schema_meta.demoDataSeeded` row. `Reset demo data` in Settings tears it down and re-seeds.
- **Soft delete** for the undo flow: `archived_at` column is set on delete, cleared on undo. Hard delete is only used internally.
- **Web feature gating** keeps native-only APIs out of the web bundle: haptics no-op, swipe-to-delete is replaced by a per-row Delete button.

## Out of scope (per PRD)

- TestFlight / Play Store distribution (no EAS submit).
- Cloud sync, auth, or push notifications.
- Maestro Android execution (iOS only for v1).
