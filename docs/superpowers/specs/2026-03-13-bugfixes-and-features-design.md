# Sit App — Bug Fixes, UI Polish & New Features

**Date:** 2026-03-13
**Status:** Approved for implementation

---

## Overview

This spec covers ~20 issues across the Home, Timer, Settings, Stats, Calendar screens plus new features (data export/import, screen blocking, notifications). Organized into implementation groups with dependencies noted.

---

## Group 1: Home Screen UI Fixes

### 1.1 Lower the hamburger button
**File:** `components/HamburgerButton.tsx`
- Change `top: 24` → `top: 48` (or use SafeAreaView inset + offset)
- This affects ALL screens since HamburgerButton is shared

### 1.2 Remove glow from Enso
**File:** `components/EnsoButton.tsx`
- Remove the shadow styles on lines 118-125 (`shadowColor: "#fff"`, `shadowOpacity: 0.08`, `shadowRadius: 24`, `elevation: 8`)
- The breathing animation View wrapping EnsoCircle has an unnecessary glow

### 1.3 Enso is never green
**File:** `app/(tabs)/index.tsx`
- Line 102: Change `color={hasSatToday ? colors.success : colors.accent}` → always pass `colors.accent`
- Remove the `hasSatToday` color conditional entirely

### 1.4 Presets a tad lower
**File:** `app/(tabs)/index.tsx`
- Line 107: Increase `marginTop: 28` → `marginTop: 40` on the preset row

### 1.5 Background more transparent
**File:** `components/GlassCard.tsx`
- Line 32: Change `rgba(40, 40, 40, 0.45)` → `rgba(40, 40, 40, 0.30)` (reduce tint opacity)

### 1.6 Preset tap behavior — select only, don't start timer
**File:** `app/(tabs)/index.tsx`
- Add state: `const [selectedPresetId, setSelectedPresetId] = useState<string | null>(() => quickPresets[0]?.id ?? null)`
- Preset `onPress`: instead of `startWithConfig()`, just `setSelectedPresetId(preset.id)`
- Selected preset gets: lighter color text (full opacity instead of 0.6), slightly bolder font weight (`fontFamily: "DMSans_600SemiBold"` instead of default)
- Unselected presets stay at `opacity-60` with normal weight
- Enso `onPress`: starts timer with the currently selected preset's config (or default if none)
- Custom button keeps current behavior (navigates to timer-setup)

### 1.7 Enso has haptic feedback on tap
**File:** `app/(tabs)/index.tsx` (or `components/EnsoButton.tsx`)
- EnsoButton already has haptic in `handlePressIn` (line 61: `Haptics.impactAsync(Medium)`) — this is already implemented
- Verify it fires on the home screen. It should since EnsoButton handles it internally.

---

## Group 2: Active Session — Finish/Pause Less Prominent

### 2.1 Make Finish and Pause buttons less prominent
**File:** `app/active-session.tsx`
- **Pause button** (line 171-180): Change from `h-16 w-16 bg-primary` filled circle → smaller ghost/outline style: `h-12 w-12 border border-muted-foreground/40` with no fill, icon color `colors.mutedForeground`
- **Finish button** (line 183-188): Change from `bg-primary py-4` full-width solid → ghost style: `border border-muted-foreground/30 py-3` with text color `text-muted-foreground` instead of `text-primary-foreground`
- Keep Discard session as-is (already subtle)

---

## Group 3: Session Recording Logic

### 3.1 Sittings under 5 min and aborted sittings don't count (not red, just ignored)
**Files:** `lib/store.ts`, `app/(tabs)/index.tsx`
- In `recordSession()`: sessions under `minimumSitMinutes` still get recorded but `qualifiedForDayCredit: false`
- This already works correctly in the code (line 310)
- **The actual fix:** when displaying last session, sessions that are unqualified should NOT show a red dot. They just show neutral (no dot or a gray/muted dot)
- In `app/(tabs)/index.tsx` line 170: Change the conditional:
  - If `lastSession.qualifiedForDayCredit` → green dot
  - If NOT qualified → no dot at all (or muted gray dot), not red

### 3.2 Only yesterday is red in Last Session card
**File:** `app/(tabs)/index.tsx`
- The red indicator should ONLY appear if the last session was yesterday AND the user hasn't sat today
- Logic: `const showRedDot = !hasSatToday && formatLastSessionTime() === "yesterday"`
- If last session was today → green dot
- If last session was yesterday and no session today → red dot (indicating overdue)
- Otherwise → no dot (neutral, just info)

---

## Group 4: Settings Fixes

### 4.1 Default minimum sit to 5 minutes and make it editable
**File:** `lib/store.ts`
- Change `defaultSettings.minimumSitMinutes` from `2` → `5`

**File:** `app/(tabs)/settings.tsx`
- Line 192-195: The "Minimum sit" row currently just displays the value as text
- Change to an editable number input (TextInput with `keyboardType="number-pad"`)
- Validate on blur: clamp to 1-30 range, save to settings
- Update settings state: `setSettings(s => ({ ...s, minimumSitMinutes: val }))`

### 4.2 Delete "Reset all data" from Settings
**File:** `app/(tabs)/settings.tsx`
- Remove the entire Data section (lines 276-283) — it doesn't work and the feature moves to history
- Keep the version text at the bottom

### 4.3 Fix notification time selectors — use native picker
**File:** `app/(tabs)/settings.tsx`
- Replace the morning/evening time TextInputs (lines 233-238, 249-254) with a native time picker
- Use `@react-native-community/datetimepicker` (needs to be added as a dependency)
- Show a Pressable that displays the current time → on press, opens native time picker
- Only the TIME selectors become native pickers. All other inputs (duration numbers, weekly goal chips) stay as they are
- **Implementation:** Install `@react-native-community/datetimepicker`, create a `TimePicker` component that wraps the native picker with a Pressable trigger

### 4.4 Actually schedule notifications
**File:** new `lib/notifications.ts`
- Install `expo-notifications`
- Request permissions on app load
- When reminder settings change, cancel existing scheduled notifications and reschedule
- Schedule daily repeating notifications at the configured times
- Morning notification: "Time to sit" (or similar)
- Evening notification: "Have you sat today?"
- Call scheduling function in settings auto-save effect and on app startup

### 4.5 Preset duration validates on focus loss (not live)
**File:** `components/PresetEditor.tsx`
- This is ALREADY correctly implemented (lines 57-60: `onBlur` handler clamps value)
- BUT the issue is that `Math.max(1, ...)` interferes with typing. If min is 1, user can type freely
- The fix: just ensure the TextInput doesn't have any `onChange` validation, only `onBlur`. Currently `onChangeText={setDurationText}` just stores raw text — this is correct
- Verify no additional validation is happening. The current code looks correct. The issue might be that on Android, the keyboard type or min value causes problems. Ensure `keyboardType="number-pad"` and no live validation.

---

## Group 5: Data Export/Import + History Drill-down

### 5.1 History screen with export/import/erase
**Approach:** Tapping "Calendar" in the drawer should show the calendar as-is, but add a header button or section that navigates to a data management sub-screen.

**Better approach per user's request:** "tapping history drills down to this section" — so History is a drawer item that goes to the calendar, and within the calendar screen there's a way to drill into data management.

**Implementation:**
- Add a settings/gear icon button in the calendar screen header (top-right)
- OR add a "Manage Data" link at the bottom of the calendar screen
- Tapping it navigates to a new screen: `app/data-management.tsx`

**File:** new `app/data-management.tsx`
- **Export data:** Serialize `AppData` to JSON, use `expo-sharing` + `expo-file-system` to save/share
- **Import data:** Use `expo-document-picker` to select a JSON file, validate structure, merge or replace data
- **Erase all data:** Big red button with confirmation dialog ("Are you sure? This will permanently erase all your meditation data and cannot be undone.")
- Back navigation to calendar

**Dependencies:** `expo-sharing`, `expo-file-system`, `expo-document-picker`

---

## Group 6: App Icon

### 6.1 Change app icon to orange enso
- The EnsoCircle SVG (`assets/images/enso-0.svg`) is already the enso shape
- Generate new icon PNGs with the enso rendered in `colors.accent` (#cc8c28) on dark background (#0a0a0a)
- Replace: `assets/images/icon.png`, `assets/images/android-icon-foreground.png`
- This requires generating image assets — use a script or the user provides them
- **Practical approach:** Create a simple script that renders the SVG to PNG at required sizes, OR ask the user to provide the icon files
- Note: This may need to be done manually since we can't render SVGs to PNGs in a CLI context. Recommend the user generate these assets using a tool like Figma or an SVG-to-PNG converter.

---

## Group 7: Stats Screen — Unified Card Design

### 7.1 Make all stat cards consistent
**File:** `components/StatCard.tsx` + `app/(tabs)/stats.tsx`
- Redesign StatCard layout:
  - Icon: top-left corner
  - Large centered KPI number (bigger font, e.g. `text-3xl` or `text-4xl`)
  - Second line beneath: the label text, centered
- Apply to ALL 8 stat cards (including the bottom 2 "days meditated" and "avg. minutes" which currently use inline styles)
- Replace inline card styles in stats.tsx with StatCard component for the bottom 2 cards

### 7.2 Card glow 50% transparent, equal on all sides
**File:** `components/StatCard.tsx`
- Update `CARD_SHADOW` to use 50% transparent glow:
  ```
  shadowColor: "#fff"
  shadowOffset: { width: 0, height: 0 }
  shadowOpacity: 0.03  (50% of current 0.06)
  shadowRadius: 14
  ```
- Or more visibly: keep shadowOpacity at 0.06 but the user said "50 pct transparent" — could mean the card background. Make card BG use `rgba(26, 26, 26, 0.50)` instead of solid `#1a1a1a`
- Ensure `shadowOffset: { width: 0, height: 0 }` for equal glow on all sides (already the case)

---

## Group 8: Calendar — Cards Match Stats

### 8.1 Unify calendar cards with stat card style
**File:** `app/(tabs)/calendar.tsx`
- The streak cards (lines 160-185) and selected day detail card (lines 128-157) use inline `CARD_BG` + `CARD_SHADOW`
- Replace with the same StatCard component or extract shared card styling
- For streak cards: use StatCard with icon (Flame for current, Award for longest)
- For the selected day detail card: use the same visual style (background, shadow, border-radius) but custom content layout

---

## Group 9: Complete Screen Block Feature

### 9.1 Block notifications and other apps during meditation
**Approach:** Full Do Not Disturb mode during active session.

**Implementation:**
- On Android: Use `expo-notifications` to set notification channel behavior, or use a native module to enable DND mode
- Cross-platform: At minimum, keep the screen awake (already done with `expo-keep-awake`) and prevent navigation away (already done with BackHandler)
- **Practical scope:** Since true DND requires native modules and special permissions (Android `ACCESS_NOTIFICATION_POLICY`):
  1. Add Android permission `ACCESS_NOTIFICATION_POLICY` to app.json
  2. Create `lib/screenBlock.ts` with functions to enable/disable DND
  3. Use Android's `NotificationManager.setInterruptionFilter()` via a small native module or `expo-modules-core`
  4. On iOS: There's no API to programmatically enable DND — show a prompt to the user to enable Focus mode manually
  5. Toggle on session start, toggle off on session end/discard

**Simpler alternative:** Use `react-native-full-screen` or similar to go full-screen immersive mode (hides status bar and navigation bar). This is simpler and doesn't require DND permissions.
- Install a fullscreen/immersive mode library
- Activate on session start, deactivate on end
- Combined with existing BackHandler + keepAwake, this provides a good "blocked" experience

---

## Group 10: Interval Bells, Background Texture, Card Transparency

### 10.1 Interval bells every 10 min + 1-minute warning
**File:** `app/active-session.tsx`
- Change interval logic from configurable `intervalMinutes` to fixed 10-minute intervals
- Add a 1-minute warning bell (fires when `remaining === 60`)
- Example: 33 min sit → bells at 10, 20, 30, and 32 minutes elapsed
- The `intervalMinutes` field stays in the type but is ignored; the toggle is still on/off

### 10.2 Background texture: crumpled paper at 50% opacity
**File:** `components/NoiseBackground.tsx`, `assets/textures/`
- Replace `noise-scratches.png` with a crumpled/wrinkled paper texture
- Change opacity from `0.8` → `0.5`
- Texture should be dark, subtle, tileable

### 10.3 Cards 80% transparent
**Files:** `components/StatCard.tsx`, `components/GlassCard.tsx`, `app/(tabs)/calendar.tsx`, `app/(tabs)/stats.tsx`
- All card backgrounds use `rgba(26, 26, 26, 0.20)` (80% transparent / 20% opaque)
- GlassCard tint: `rgba(40, 40, 40, 0.20)`

---

## Group 11: Tests

### 10.1 Unit tests for session recording logic
- Test that sessions under 5 min get `qualifiedForDayCredit: false`
- Test that aborted sessions (discard) don't create a record
- Test streak calculation with qualified/unqualified sessions
- Test data export JSON structure

### 10.2 Component tests
- Test preset selection state (tap preset selects, tap enso starts)
- Test last session card dot color logic (green for qualified, red only for yesterday, neutral otherwise)
- Test notification scheduling logic

### 10.3 E2E test updates
- Update existing Playwright tests for changed UI (preset behavior, settings changes)

---

## Dependency Installation Summary

```bash
npx expo install @react-native-community/datetimepicker expo-notifications expo-sharing expo-file-system expo-document-picker
```

---

## Implementation Order (recommended)

1. **Group 1** (Home UI fixes) — quick wins, no dependencies
2. **Group 2** (Active session buttons) — quick win
3. **Group 3** (Session recording logic) — important correctness fix
4. **Group 4** (Settings fixes) — includes notification work (larger)
5. **Group 5** (Data export/import) — new feature, medium scope
6. **Group 7+8** (Stats + Calendar card unification) — visual polish
7. **Group 6** (App icon) — needs asset generation
8. **Group 9** (Screen block) — most complex, native module work
9. **Group 10** (Tests) — alongside each group
