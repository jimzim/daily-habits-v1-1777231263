# Daily Habits v1 — Execution Plan

**Build ID:** `daily-habits-v1-20260426184533`
**Platform:** native (hybrid — iOS + Android + Vercel-hosted Expo Web)
**Total tasks:** 74 (71 `[BUILD]` + 3 `[TEST]`)

---

## 1. Executive Summary

A polished daily-habit tracker built with Expo Router + TypeScript that ships from one codebase to **iOS** (TestFlight-eligible binary, source pushed to GitHub), **Android** (binary, source pushed to GitHub), and **web** (Expo's `react-native-web` static export deployed to Vercel).

**Tech stack (locked by PRD):**
- Expo SDK 52+ / React Native 0.83+ / TypeScript strict
- Expo Router v4 (file-based, typed routes) — `app/(tabs)/...`
- expo-sqlite (habits + completions) + expo-sqlite/kv-store (prefs)
- @gorhom/bottom-sheet (Add/Edit Habit)
- react-native-gesture-handler (swipe-to-delete) + react-native-reanimated 3 (springs)
- expo-haptics (completion feedback) — gracefully no-ops on web
- react-native-safe-area-context — required for notch handling
- react-native-web — REQUIRED for `expo export --platform web`
- Maestro (iOS native e2e) + Playwright (web e2e) + Jest/RTL (units)

**Key risk areas (gotchas baked into per-task ACs):**
- SQLite migrations idempotent (`CREATE TABLE IF NOT EXISTS`) and seed gated on `UserPrefs.demoDataSeeded`.
- Streak math uses local-timezone `YYYY-MM-DD` from `toLocaleDateString('en-CA')`.
- Web variant must `Platform.OS !== 'web'` guard haptics + swipe gesture; web gets a hover/click "Delete" button instead.
- `GestureHandlerRootView` MUST wrap the root layout, and `SafeAreaProvider` MUST wrap below it.
- Reanimated babel plugin must be the LAST entry in `babel.config.js`.

**Out of scope (per PRD, do NOT add):** TestFlight/Play submit, cloud sync/auth, push notifications, Maestro Android execution.

---

## 2. Batch Organization

The 74 tasks are organized into 12 batches. Each batch's tasks must complete before its validation checkpoint advances the build to the next batch. Dependencies between batches are honored by the existing `blockedBy` graph in TaskList — batch numbers are an organizational overlay only.

---

### Batch 0 — Project Foundation (5 tasks)
**Goal:** Bare Expo project boots on iOS Simulator with theme tokens and tri-platform config wired.

- #1 Initialize Expo project (TypeScript + Expo Router)
- #2 Install all PRD-required dependencies
- #3 Configure app.json for tri-platform deploy
- #4 Define theme tokens (colors + typography)
- #5 iOS Simulator Launch Verification ← **gate**

**Builds:** Empty Expo Router app with `react-native-web`, `expo-sqlite`, `@gorhom/bottom-sheet`, `react-native-gesture-handler`, `react-native-reanimated`, `expo-haptics`, `react-native-safe-area-context`, NativeWind (if PRD-compatible) installed; `app.json` configured with bundle IDs, icon stubs, web `output: "static"`.
**Validation:** `npx tsc --noEmit` passes • `npx expo run:ios` boots a blank screen without redbox • `npx expo start --web` serves on :8081 • `npx expo export --platform web` succeeds and writes `dist/`.

---

### Batch 1 — Data Layer Primitives (5 tasks)
**Goal:** Pure utilities + SQLite schema in place, exercisable in unit tests without UI.

- #7 Date utilities (timezone-safe YYYY-MM-DD)
- #8 Streak math utilities (pure functions)
- #6 SQLite schema and migrations module
- #9 Habit CRUD module (`db/habits.ts`)
- #10 Completion CRUD module (`db/completions.ts`)

**Builds:** `utils/date.ts` (local-tz helpers), `utils/streak-math.ts` (current-streak, longest-streak, monthly-completion%), `db/schema.ts` (idempotent `CREATE TABLE IF NOT EXISTS` + version row), `db/habits.ts` + `db/completions.ts` (typed CRUD against SQLite handle).
**Validation:** `npx tsc --noEmit` passes • Jest unit tests for `streak-math.ts` cover daily / weekdays / 3x-week / 5x-week frequencies + DST boundary case.

---

### Batch 2 — Mock Data + Persistence Verification (2 tasks)
**Goal:** App seeds 5 habits + ~80 completions on first launch, exactly once.

- #11 Mock data seeding (5 habits + ~80 completions)
- #12 SQLite Seed Validation ← **gate**

**Builds:** `db/seed.ts` gated on `UserPrefs.demoDataSeeded`. Seeded habits: "Drink water" (80% completion), "Read 20 min" (60%), "Walk 30 min" (40%), "Meditate" (50%), "No phone after 9pm" (30%) over the last 30 days.
**Validation:** Cold launch on iOS Simulator → 5 habits visible (verified via SQL inspection) • Hot reload does not duplicate seed rows • Android Emulator boot also seeds correctly.

---

### Batch 3 — Context + Hooks (6 tasks)
**Goal:** All providers and view-model hooks wired, decoupled from screens.

- #13 PreferencesContext (theme + haptics)
- #14 ToastContext + ToastProvider
- #17 useTheme hook
- #18 useHaptics hook
- #15 useHabits hook
- #16 useStreak hook

**Builds:** `stores/PreferencesContext.tsx` (reads/writes prefs to kv-store), `stores/ToastContext.tsx` (4-second auto-dismiss + undo callback slot), `hooks/useTheme.ts` (resolves `system|light|dark`), `hooks/useHaptics.ts` (no-ops on web via `Platform.OS`), `hooks/useHabits.ts` + `hooks/useStreak.ts` (typed selectors).
**Validation:** `npx tsc --noEmit` passes • Hook integration tests via RTL mock provider tree.

---

### Batch 4 — Primitive UI Components (12 tasks)
**Goal:** All design-system primitives exist with accessibility labels, ready to compose.

- #25 Button component (pill-shaped, 44pt)
- #26 Card component
- #27 Input component (controlled text field)
- #19 Toast component (visual)
- #20 Skeleton shimmer component
- #21 ConfirmDialog component
- #22 BottomSheet wrapper around @gorhom/bottom-sheet
- #23 StreakBadge component
- #24 Empty state component
- #28 Icon picker (emoji palette)
- #29 Color picker (palette swatches)
- #30 Frequency selector component

**Builds:** Components in `src/components/` honoring brand tokens from #4 — pill buttons (44pt min), 12px-radius cards with subtle shadow, skeleton shimmer animated via Reanimated, Toast slides from bottom with spring, BottomSheet wrapper exports `present()`/`dismiss()` ref. All have `testID` + `data-testid` per PRD test-id convention.
**Validation:** `npx tsc --noEmit` passes • Component snapshot tests in light + dark themes • Visual smoke: render gallery screen on iOS + Android + web.

---

### Batch 5 — App Shell + Navigation (5 tasks)
**Goal:** Tabs render, root providers wrap correctly, no redbox.

- #31 Root layout with providers (`app/_layout.tsx`)
- #32 Tabs layout (Today / History / Settings)
- #33 HabitRow component
- #34 HabitListEmpty component
- #56 Safe area handling on every screen

**Builds:** `app/_layout.tsx` wraps `<GestureHandlerRootView>` → `<SafeAreaProvider>` → `<PreferencesContext>` → `<ToastProvider>`. `app/(tabs)/_layout.tsx` defines bottom tabs. `HabitRow` shows checkbox, name, streak badge; `HabitListEmpty` uses #24 with "Add your first habit" CTA. Every screen consumes `useSafeAreaInsets()`.
**Validation:** `npx tsc --noEmit` passes • iOS + Android + web all show three tabs • No content under iOS notch / Android status bar.

---

### Batch 6 — Today Screen Core (4 tasks)
**Goal:** Today's habits list with completion interaction works on all 3 platforms.

- #35 Today screen (FlatList of habits)
- #36 Tap-to-complete with haptic + spring + toast
- #37 Today: completed habits dim and sort to bottom
- #38 Today: pull-to-refresh

**Builds:** `app/(tabs)/today.tsx` renders FlatList over seeded habits. Tap-to-complete fires haptic (native only), spring animation on the checkmark, toast "Habit completed". Pull-to-refresh calls `useHabits().refresh()`.
**Validation:** iOS: tap a checkmark → see haptic + toast + row dims and moves to bottom • Android: same minus haptic if sim has none • Web: same minus haptic + minus pull-to-refresh (web shows a button instead).

**Cross-platform check:** Run `npx expo export --platform web` to confirm web export still passes.

---

### Batch 7 — Add / Edit / Delete Flow (5 tasks)
**Goal:** Full CRUD via UI on all 3 platforms, including swipe-to-delete + 4-second undo.

- #39 AddHabitSheet (form + validation + save)
- #40 Edit habit flow (sheet pre-population)
- #41 Swipe-to-delete gesture (native iOS + Android)
- #42 Web fallback Delete button (visible on hover)
- #43 Delete habit + 4-second undo toast
- #57 Keyboard avoidance on AddHabitSheet

**Builds:** Bottom sheet with name (required), frequency selector, icon + color picker. Save disabled until name. Swipe gesture wraps `HabitRow` in `Swipeable` from gesture-handler — only on `Platform.OS !== 'web'`. Web shows a small Delete button on hover. Soft-delete via `archivedAt`; undo within 4 s clears it.
**Validation:** iOS Simulator: full add → edit → delete → undo cycle works • Android Emulator: same • Web: same with hover-Delete instead of swipe • Keyboard does not cover the Save button on either platform.

---

### Batch 8 — Detail + History (5 tasks)
**Goal:** Streak history, calendar view, and overview stats.

- #44 Habit detail route (`app/habit/[id].tsx`)
- #45 HabitDetailCalendar component
- #46 Habit detail stats panel
- #47 Detail screen skeleton loader (>200ms)
- #48 History screen (overall stats overview)

**Builds:** Tap a habit row → `router.push('/habit/[id]')`. Detail screen: stats (current/longest streak, monthly %, total completions) + calendar grid for current month with completion dots. Skeleton renders for loads >200 ms. History tab shows aggregate stats over all habits.
**Validation:** `npx tsc --noEmit` passes • iOS + Android + web: detail screen renders calendar without overflow on small devices.

---

### Batch 9 — Settings + Branding + A11y (8 tasks)
**Goal:** Settings shipped, dark mode no-flash, accessibility labels everywhere, app icon + splash.

- #49 Settings screen scaffold
- #50 Theme toggle (system / light / dark)
- #51 Reset Demo Data action
- #52 About page (version, privacy, acknowledgments)
- #53 App icon and splash screen branding
- #54 Dark mode no-flash on launch
- #55 Accessibility labels on all interactive elements
- #58 Data persistence verification (kill + relaunch)

**Builds:** Settings tab with theme picker, "Reset demo data" (ConfirmDialog), About modal/page. Splash screen branded — root waits on font + theme load before hiding splash. Every interactive element has `accessibilityLabel`. Persistence test: kill app, relaunch, all habits + completions survive.
**Validation:** Cold-launch in dark mode → no flash of light theme • iOS VoiceOver: every checkmark, FAB, edit, delete has a meaningful label • Reset demo → ConfirmDialog → seed re-runs → toast confirms.

---

### Batch 10 — Web Build + Vercel Config (2 tasks)
**Goal:** Web export passes and Vercel SPA routing is configured.

- #59 Web build verification (`expo export --platform web`)
- #60 Vercel deploy config (`vercel.json` SPA routing)

**Builds:** `expo export --platform web` → `dist/` (PRD CRITICAL gotcha: `react-native-web` must be in deps). `vercel.json` with SPA rewrites so deep links work.
**Validation:** `dist/` contains `index.html`, JS bundle, static assets • Local `npx serve dist` shows working app.

---

### Batch 11 — Maestro + Playwright + README (8 tasks)
**Goal:** Native + web e2e suites authored against the same `testID` / `data-testid` conventions.

- #63 Set up Maestro infrastructure (`.maestro` directory + config)
- #64 Maestro flow: `add_habit_and_complete`
- #65 Maestro flow: `swipe_to_delete_with_undo`
- #66 Maestro flow: `navigate_to_detail`
- #67 Set up Playwright for Expo web build
- #68 Playwright flow: `counter_complete_habit`
- #69 Playwright flow: `empty_state_visible_with_no_habits`
- #70 README.md with setup, scripts, and architecture

**Builds:** `.maestro/<flow>.yaml` × 3 (iOS only — Android Maestro is OUT OF SCOPE per PRD). `tests/web/<flow>.spec.ts` × 2 reusing the same test-id strings as Maestro. `README.md` documents `npm` scripts, EAS commands (for follow-up), and how to run Maestro + Playwright locally.
**Validation:** `npx tsc --noEmit` passes • README's quick-start commands all run cleanly.

---

### Batch 12 — Final Verification, Tests, Terminal Steps (6 tasks)
**Goal:** Build verified clean, tests recorded fail-soft, web shipped to Vercel, source shipped to GitHub. **Terminal steps run independently of test outcome (PRD #56 TERMINAL-001).**

**Build verification first:**
- #71 FINAL-1: Build verification

**Test execution (fail-soft — caps at 7 min, outcome recorded as `subPlatformsTested[]` annotation, NOT a gate on terminal steps):**
- #72 [TEST] Playwright Test Execution (web)
- #73 [TEST] Maestro iOS Test Execution (cap: 7m, fail-soft)

**Terminal steps (independent of #72 / #73 — the build ships even if a test wedges):**
- #62 [DEPLOY] Vercel deploy `dist/ --prod` (depends only on #59 web export + #60 vercel.json)
- #61 [REPO] Initialize GitHub repo + push code (depends only on #70 README)

**Final report:**
- #74 PRD Feature Verification (records test outcomes + captured Vercel URL + captured GitHub URL)

**Validation:**
- `rm -rf node_modules .expo dist && npm install` clean • `npx tsc --noEmit` passes • `npx eslint . --ext .ts,.tsx` passes • `npx expo export --platform web` passes • Vercel URL is reachable • GitHub URL resolves to a public/private repo with the source • Step 6 report contains BOTH a Vercel URL AND a GitHub URL.

---

## 3. Tech Defaults (locked unless PRD overrides)

| Concern | Choice |
|---|---|
| Framework | Expo SDK 52+ / RN 0.83+ / Expo Router v4 / TypeScript strict |
| Styling | NativeWind v4 (Tailwind for RN) — graceful fallback to StyleSheet for RN-incompatible utilities (`grid`, `hover:` on native) |
| Storage | `expo-sqlite` (habits, completions) + `expo-sqlite/kv-store` (prefs) |
| Navigation | Expo Router file-based + typed routes |
| Bottom sheet | `@gorhom/bottom-sheet` (peer-deps: gesture-handler + reanimated) |
| Gestures | `react-native-gesture-handler` (root: `<GestureHandlerRootView>`) |
| Animations | `react-native-reanimated` 3 (babel plugin must be LAST in `babel.config.js`) |
| Haptics | `expo-haptics` (web no-ops via `Platform.OS !== 'web'` guard) |
| Web bridge | `react-native-web` (REQUIRED — `expo export --platform web` fails without it) |
| Safe area | `react-native-safe-area-context` (root: `<SafeAreaProvider>`) |
| Native testing | Maestro (iOS only — Android out of scope per PRD) |
| Web testing | Playwright |
| Web deploy | Vercel (`vercel deploy dist/ --prod`) |
| Source deploy | GitHub repo (TestFlight / Play submit OUT OF SCOPE per PRD) |

---

## 4. Platform Verification Strategy

| Batch | iOS Sim | Android Emu | Web | Maestro | Playwright |
|---|:-:|:-:|:-:|:-:|:-:|
| 0 (foundation) | ✅ | ✅ | ✅ | — | — |
| 1 (data utils, no UI) | type-check only | — | — | — | — |
| 2 (seed verify) | ✅ | ✅ | — | — | — |
| 3 (hooks/contexts) | type-check only | — | — | — | — |
| 4 (primitives gallery) | ✅ | ✅ | ✅ | — | — |
| 5 (shell + tabs) | ✅ | ✅ | ✅ | — | — |
| 6 (Today screen) | ✅ | ✅ | ✅ | — | — |
| 7 (CRUD flow) | ✅ | ✅ | ✅ | — | — |
| 8 (detail + history) | ✅ | spot check | spot check | — | — |
| 9 (settings + a11y) | ✅ | spot check | spot check | — | — |
| 10 (web export + Vercel cfg) | — | — | ✅ | — | — |
| 11 (test authoring) | ✅ | — | ✅ | author only | author only |
| 12 (final + terminal) | ✅ | ✅ | ✅ | execute (fail-soft) | execute (fail-soft) |

**Cross-platform discipline:** iOS is the primary day-to-day target; Android + web get full checks at Batch 0, 2, 4, 5, 6, 7, and 12. Spot checks at 8 and 9 keep regressions cheap to find.

---

## 5. Validation Checkpoints (run after each batch)

```bash
# Type + lint (every batch)
npx tsc --noEmit
npx eslint . --ext .ts,.tsx

# iOS run (most batches)
npx expo run:ios

# Android run (Batch 0, 2, 4, 5, 6, 7, 12)
npx expo run:android

# Web smoke (Batch 0, 2, 4, 5, 6, 7, 10, 12)
npx expo start --web
npx expo export --platform web

# Unit tests (Batch 1+)
npm test

# Maestro flows (Batch 12)
maestro test .maestro/

# Playwright flows (Batch 12)
npx playwright test
```

---

## 6. Build Commands Reference

```bash
# Development
npx expo start                                   # Dev server (Metro)
npx expo start --web                             # Web dev server
npx expo run:ios                                 # iOS simulator
npx expo run:android                             # Android emulator

# Type checking & lint
npx tsc --noEmit
npx eslint . --ext .ts,.tsx

# Testing
npm test                                         # Jest + RTL
maestro test .maestro/                           # Native e2e (iOS only per PRD)
npx playwright test                              # Web e2e

# Building
npx expo export --platform web                   # → dist/
eas build --platform ios --profile preview       # iOS preview (out of scope for v1 ship)
eas build --platform android --profile preview   # Android preview (out of scope for v1 ship)

# Distribution
vercel deploy dist/ --prod                       # Web → Vercel
gh repo create && git push -u origin main        # Source → GitHub
# eas submit --platform ios                      # OUT OF SCOPE per PRD
```

---

## 7. Final Batch Acceptance (Batch 12)

- README.md ships with setup, all npm scripts, EAS preview commands, and Maestro / Playwright instructions
- 3 Maestro flows cover real iOS user journeys (add+complete, swipe+undo, navigate-to-detail)
- 2 Playwright flows cover web (counter_complete_habit, empty_state_visible_with_no_habits)
- App icon + splash + brand-tinted launch screen on iOS + Android + web
- Clean build: `rm -rf node_modules .expo dist && npm install && npx expo export --platform web && npx tsc --noEmit && npx eslint . --ext .ts,.tsx` all pass
- Vercel URL captured in `.manifest/state.json` and reachable
- GitHub repo URL captured in `.manifest/state.json` and resolves
- Step 6 build report contains BOTH the Vercel URL AND the GitHub repo URL
- All PRD success criteria checkboxes pass

---

## 8. Known React Native Gotchas (per-batch reminders)

- **NativeWind:** `hover:` is web-only on RN; `grid` doesn't map — fall back to `flex-row flex-wrap`. (Batches 4–9.)
- **react-native-maps:** Out of scope for this PRD (no map screens). N/A.
- **expo-sqlite on web:** Backed by `sql.js` on web — verify migrations + seed run on web build too. (Batches 1, 2, 10.)
- **Gesture Handler:** `<GestureHandlerRootView>` must wrap the entire app at the root. (Batch 5.)
- **Reanimated:** `react-native-reanimated/plugin` must be the LAST entry in `babel.config.js`. (Batch 0.)
- **expo-image:** Use `contentFit` (not `resizeMode`). N/A unless habit icons use remote images.
- **Android back button:** Hardware back must dismiss the bottom sheet, not pop the tab. (Batch 7.)
- **Safe areas:** Use `useSafeAreaInsets()` on every screen — content must clear the notch + home indicator. (Batch 5, 9.)
- **Font loading:** Splash stays up until fonts + initial DB seed are ready (`expo-splash-screen.preventAutoHideAsync`). (Batch 0, 9.)
- **StatusBar:** Style per-screen — light content on dark headers, dark on light. (Batch 5, 8.)
- **Streak math timezone:** Use `new Date().toLocaleDateString('en-CA')` for `YYYY-MM-DD`, NOT UTC. (Batch 1.)
- **Web feature gating:** `expo-haptics` and gesture-handler swipe must be `Platform.OS !== 'web'` guarded; web gets a Delete button on hover instead. (Batch 6, 7.)
- **Maestro polling:** While waiting for `expo run:ios` readiness in test setup, use a bounded `until`-loop with a hard wall-clock cap — never `ScheduleWakeup`. (Batch 12.)

---

## 9. Terminal-Step Independence (PRD #56 TERMINAL-001)

The dependency graph in TaskList already reflects the correct shape — verified before plan write:

```
#62 Vercel deploy        ← depends only on  #59 (web export) + #60 (vercel.json)
#61 GitHub push          ← depends only on  #70 (README)        # README is build artifact
#74 PRD Feat Verify      ← reports on #62, #61, #72, #73 (this is the report task, not a terminal step)
```

Neither #61 nor #62 depends on `[TEST]` tasks #72 or #73. iOS test outcome and Playwright test outcome are recorded as `subPlatformsTested[]` / `subPlatformsSkipped[]` annotations in #74's report — they DO NOT gate the terminal deploy/push steps. If Maestro wedges or Playwright fails, the web variant still ships to Vercel and the native source still pushes to GitHub.
