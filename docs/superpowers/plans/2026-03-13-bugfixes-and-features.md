# Sit App Bug Fixes, UI Polish & New Features — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix ~20 UI bugs, logic issues, and add data export/import + screen blocking + working notifications across the Sit meditation app.

**Architecture:** React Native / Expo Router app with AsyncStorage-based state, file-based routing under `app/`, shared components in `components/`, and core logic in `lib/`. Drawer navigation with 4 tabs: Home, Calendar, Stats, Settings. Timer flow: Home → active-session → session-complete.

**Tech Stack:** React Native 0.83, Expo SDK 55, TypeScript, NativeWind (Tailwind), Reanimated, expo-haptics, expo-av, AsyncStorage.

**Spec:** `docs/superpowers/specs/2026-03-13-bugfixes-and-features-design.md`

---

## Chunk 1: Home Screen UI Fixes

### Task 1: Lower the hamburger button

**Files:**
- Modify: `components/HamburgerButton.tsx:12` — change `top: 24` to `top: 48`

- [ ] **Step 1: Modify HamburgerButton position**

In `components/HamburgerButton.tsx` line 12, change:
```tsx
style={{ position: "absolute", top: 24, left: 24, zIndex: 10 }}
```
to:
```tsx
style={{ position: "absolute", top: 48, left: 24, zIndex: 10 }}
```

- [ ] **Step 2: Verify on device/simulator**

Run: `npx expo start`
Check: Hamburger icon sits lower, below the status bar area on all screens (Home, Calendar, Stats, Settings all use HamburgerButton).

- [ ] **Step 3: Adjust content top margins**

Since the hamburger moved down, check that no screen content overlaps. Currently all screens use `marginTop: 64` or `paddingTop: 64` for content below the hamburger. If `top: 48` + icon size (22) = 70px, increase content margins to `72` or `76` if needed.

Files to check/adjust:
- `app/(tabs)/index.tsx:83` — `marginTop: 64` (greeting)
- `app/(tabs)/stats.tsx:48` — `marginTop: 64`
- `app/(tabs)/calendar.tsx:59` — `marginTop: 64`
- `app/(tabs)/settings.tsx:129` — `paddingTop: 64`

- [ ] **Step 4: Commit**

```bash
git add components/HamburgerButton.tsx app/(tabs)/index.tsx app/(tabs)/stats.tsx app/(tabs)/calendar.tsx app/(tabs)/settings.tsx
git commit -m "fix: lower hamburger button position"
```

---

### Task 2: Remove glow from Enso

**Files:**
- Modify: `components/EnsoButton.tsx:117-126`

- [ ] **Step 1: Remove shadow styles from EnsoButton**

In `components/EnsoButton.tsx`, replace the View wrapping EnsoCircle (lines 116-129):
```tsx
          <View
            style={{
              width: ENSO_SIZE,
              height: ENSO_SIZE,
              borderRadius: ENSO_SIZE / 2,
              shadowColor: "#fff",
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.08,
              shadowRadius: 24,
              elevation: 8,
            }}
          >
            <EnsoCircle size={ENSO_SIZE} color={color} />
          </View>
```
with:
```tsx
          <View
            style={{
              width: ENSO_SIZE,
              height: ENSO_SIZE,
            }}
          >
            <EnsoCircle size={ENSO_SIZE} color={color} />
          </View>
```

- [ ] **Step 2: Verify**

Check Home screen — enso circle should have no white glow around it.

- [ ] **Step 3: Commit**

```bash
git add components/EnsoButton.tsx
git commit -m "fix: remove glow from enso circle"
```

---

### Task 3: Enso is never green

**Files:**
- Modify: `app/(tabs)/index.tsx:102`

- [ ] **Step 1: Remove green color conditional**

In `app/(tabs)/index.tsx` line 100-103, change:
```tsx
        <EnsoButton
          onPress={() => defaultPreset && startWithConfig(presetToConfig(defaultPreset))}
          color={hasSatToday ? colors.success : colors.accent}
        />
```
to:
```tsx
        <EnsoButton
          onPress={() => defaultPreset && startWithConfig(presetToConfig(defaultPreset))}
          color={colors.accent}
        />
```

Note: Keep the `hasSatToday` variable — it's still used for the greeting text on line 94.

- [ ] **Step 2: Commit**

```bash
git add app/(tabs)/index.tsx
git commit -m "fix: enso always uses accent color, never green"
```

---

### Task 4: Move presets lower

**Files:**
- Modify: `app/(tabs)/index.tsx:107`

- [ ] **Step 1: Increase preset row top margin**

In `app/(tabs)/index.tsx` line 107, change:
```tsx
      <View className="flex-row justify-center" style={{ marginTop: 28, gap: 28 }}>
```
to:
```tsx
      <View className="flex-row justify-center" style={{ marginTop: 40, gap: 28 }}>
```

- [ ] **Step 2: Commit**

```bash
git add app/(tabs)/index.tsx
git commit -m "fix: move preset buttons slightly lower"
```

---

### Task 5: GlassCard background more transparent

**Files:**
- Modify: `components/GlassCard.tsx:32`

- [ ] **Step 1: Reduce tint opacity**

In `components/GlassCard.tsx` line 32, change:
```tsx
    backgroundColor: "rgba(40, 40, 40, 0.45)",
```
to:
```tsx
    backgroundColor: "rgba(40, 40, 40, 0.30)",
```

- [ ] **Step 2: Commit**

```bash
git add components/GlassCard.tsx
git commit -m "fix: make glass card background more transparent"
```

---

### Task 6: Preset tap selects instead of starting timer + Enso launches timer

This is the most significant home screen change. Currently, tapping any preset calls `startWithConfig()` which navigates to the active session. After this change, tapping a preset only selects it (visual highlight), and only tapping the Enso circle starts the timer.

**Files:**
- Modify: `app/(tabs)/index.tsx`

- [ ] **Step 1: Add selectedPresetId state**

In `app/(tabs)/index.tsx`, after the `quickPresets` and `defaultPreset` declarations (around line 47), add:
```tsx
const [selectedPresetId, setSelectedPresetId] = useState<string | null>(
  () => quickPresets[0]?.id ?? null
);
const selectedPreset = quickPresets.find((p) => p.id === selectedPresetId) || defaultPreset;
```

Add `useState` to the existing import if not already there (it's already imported on line 7).

- [ ] **Step 2: Change Enso onPress to start timer with selected preset**

Replace the EnsoButton (around line 100):
```tsx
        <EnsoButton
          onPress={() => defaultPreset && startWithConfig(presetToConfig(defaultPreset))}
          color={colors.accent}
        />
```
with:
```tsx
        <EnsoButton
          onPress={() => selectedPreset && startWithConfig(presetToConfig(selectedPreset))}
          color={colors.accent}
        />
```

- [ ] **Step 3: Change preset buttons to select instead of start**

Replace the preset mapping block (lines 108-118):
```tsx
        {quickPresets.map((preset) => (
          <Pressable
            key={preset.id}
            onPress={() => startWithConfig(presetToConfig(preset))}
            className="active:opacity-70"
          >
            <Text className="text-base text-foreground opacity-60">
              {preset.duration} min
            </Text>
          </Pressable>
        ))}
```
with:
```tsx
        {quickPresets.map((preset) => {
          const isSelected = preset.id === selectedPresetId;
          return (
            <Pressable
              key={preset.id}
              onPress={() => setSelectedPresetId(preset.id)}
              className="active:opacity-70"
            >
              <Text
                style={isSelected ? { fontFamily: "DMSans_600SemiBold" } : undefined}
                className={`text-base text-foreground ${isSelected ? "opacity-90" : "opacity-50"}`}
              >
                {preset.duration} min
              </Text>
            </Pressable>
          );
        })}
```

- [ ] **Step 4: Verify behavior**

- Tap a preset → only visual selection changes (bolder, lighter text)
- Tap Enso → timer starts with the selected preset config
- Default: first preset is selected on load
- Custom button still navigates to timer-setup

- [ ] **Step 5: Commit**

```bash
git add app/(tabs)/index.tsx
git commit -m "feat: preset tap selects, only enso tap starts timer"
```

---

### Task 7: Last session card — fix dot color logic

Currently the dot is green for qualified, red for unqualified. The fix: only show red if last session was yesterday and user hasn't sat today. Unqualified sessions get no dot (they just don't count).

**Files:**
- Modify: `app/(tabs)/index.tsx:165-177`

- [ ] **Step 1: Update last session dot logic**

Replace the last session GlassCard block (lines 165-177):
```tsx
          {lastSession && (
            <GlassCard className="flex-row items-center justify-between px-5 py-3.5">
              <Text className="text-sm text-muted-foreground">Last Session</Text>
              <View className="flex-row items-center gap-2">
                <View
                  className={`h-2.5 w-2.5 rounded-full ${lastSession.qualifiedForDayCredit ? "bg-success" : "bg-destructive"}`}
                />
                <Text className="text-sm text-muted-foreground">
                  {lastSession.durationMinutes}min, {formatLastSessionTime()}
                </Text>
              </View>
            </GlassCard>
          )}
```
with:
```tsx
          {lastSession && (() => {
            const lastTime = formatLastSessionTime();
            const showGreen = lastSession.qualifiedForDayCredit && lastTime === "today";
            const showRed = !hasSatToday && lastTime === "yesterday";
            return (
              <GlassCard className="flex-row items-center justify-between px-5 py-3.5">
                <Text className="text-sm text-muted-foreground">Last Session</Text>
                <View className="flex-row items-center gap-2">
                  {(showGreen || showRed) && (
                    <View
                      className={`h-2.5 w-2.5 rounded-full ${showGreen ? "bg-success" : "bg-destructive"}`}
                    />
                  )}
                  <Text className="text-sm text-muted-foreground">
                    {lastSession.durationMinutes}min, {lastTime}
                  </Text>
                </View>
              </GlassCard>
            );
          })()}
```

Logic:
- **Green dot:** last session qualified AND was today
- **Red dot:** user hasn't sat today AND last session was yesterday (overdue signal)
- **No dot:** all other cases (old sessions, unqualified sessions — they just don't count)

- [ ] **Step 2: Commit**

```bash
git add app/(tabs)/index.tsx
git commit -m "fix: last session dot green=today, red=yesterday-overdue, none=other"
```

---

## Chunk 2: Active Session + Settings Fixes

### Task 8: Make Finish and Pause buttons less prominent

**Files:**
- Modify: `app/active-session.tsx:169-192`

- [ ] **Step 1: Restyle pause and finish buttons**

In `app/active-session.tsx`, replace the bottom controls section (lines 169-192):
```tsx
      <View className="w-full items-center gap-4">
        {remaining > 0 && (
          <Pressable
            onPress={() => setPaused(!paused)}
            className="h-16 w-16 items-center justify-center rounded-full bg-primary"
          >
            {paused ? (
              <Play color={colors.primaryForeground} size={24} style={{ marginLeft: 2 }} />
            ) : (
              <Pause color={colors.primaryForeground} size={24} />
            )}
          </Pressable>
        )}

        <Pressable
          onPress={() => handleFinish(elapsed)}
          className="w-full rounded-2xl bg-primary py-4 items-center"
        >
          <Text className="font-semibold text-primary-foreground">Finish</Text>
        </Pressable>
        <Pressable onPress={handleDiscard}>
          <Text className="text-sm text-muted-foreground">Discard session</Text>
        </Pressable>
      </View>
```
with:
```tsx
      <View className="w-full items-center gap-4">
        {remaining > 0 && (
          <Pressable
            onPress={() => setPaused(!paused)}
            className="h-12 w-12 items-center justify-center rounded-full"
            style={{ borderWidth: 1, borderColor: "rgba(115,115,115,0.4)" }}
          >
            {paused ? (
              <Play color={colors.mutedForeground} size={20} style={{ marginLeft: 2 }} />
            ) : (
              <Pause color={colors.mutedForeground} size={20} />
            )}
          </Pressable>
        )}

        <Pressable
          onPress={() => handleFinish(elapsed)}
          className="w-full rounded-2xl py-3 items-center"
          style={{ borderWidth: 1, borderColor: "rgba(115,115,115,0.3)" }}
        >
          <Text className="text-sm text-muted-foreground">Finish</Text>
        </Pressable>
        <Pressable onPress={handleDiscard}>
          <Text className="text-sm text-muted-foreground">Discard session</Text>
        </Pressable>
      </View>
```

- [ ] **Step 2: Commit**

```bash
git add app/active-session.tsx
git commit -m "fix: make pause and finish buttons less prominent"
```

---

### Task 9: Default minimum sit to 5 minutes + make editable

**Files:**
- Modify: `lib/store.ts:28`
- Modify: `app/(tabs)/settings.tsx:191-195`

- [ ] **Step 1: Change default minimum sit**

In `lib/store.ts` line 28, change:
```tsx
  minimumSitMinutes: 2,
```
to:
```tsx
  minimumSitMinutes: 5,
```

- [ ] **Step 2: Make minimum sit editable in settings**

In `app/(tabs)/settings.tsx`, add state for the minimum sit text input. After `const [commitment, setCommitment]` (line 29), add:
```tsx
const [minSitText, setMinSitText] = useState(String(settings.minimumSitMinutes));
```

Then replace the "Minimum sit" Row (lines 192-195):
```tsx
            <Row>
              <Text className="text-sm text-foreground">Minimum sit</Text>
              <Text className="text-sm text-muted-foreground">{settings.minimumSitMinutes} min</Text>
            </Row>
```
with:
```tsx
            <Row>
              <Text className="text-sm text-foreground">Minimum sit</Text>
              <View className="flex-row items-center gap-2">
                <TextInput
                  value={minSitText}
                  onChangeText={setMinSitText}
                  onBlur={() => {
                    const val = Math.min(30, Math.max(1, parseInt(minSitText) || 5));
                    setMinSitText(String(val));
                    setSettings((s) => ({ ...s, minimumSitMinutes: val }));
                  }}
                  keyboardType="number-pad"
                  className="w-12 rounded-lg bg-muted px-2 py-1.5 text-sm text-foreground text-center"
                  maxLength={2}
                />
                <Text className="text-sm text-muted-foreground">min</Text>
              </View>
            </Row>
```

- [ ] **Step 3: Commit**

```bash
git add lib/store.ts app/(tabs)/settings.tsx
git commit -m "fix: default minimum sit to 5min, make it editable"
```

---

### Task 10: Remove "Reset all data" from Settings

**Files:**
- Modify: `app/(tabs)/settings.tsx:275-283`

- [ ] **Step 1: Remove the Data section**

In `app/(tabs)/settings.tsx`, delete the Data section (lines 275-283):
```tsx
          {/* Data */}
          <Section title="Data">
            <Pressable
              onPress={handleReset}
              className="w-full rounded-2xl bg-card px-5 py-4"
            >
              <Text className="text-sm text-destructive">Reset all data</Text>
            </Pressable>
          </Section>
```

Also remove the `handleReset` function (lines 42-63) and the unused imports: remove `resetData, initStore` from the store import (line 6) — but keep them if they'll be needed later for the data management screen. Actually, leave the imports for now since they'll be used in the new data-management screen.

Wait — actually remove the `handleReset` function since it moves to the data management screen. Clean up:
- Remove `handleReset` function (lines 42-63)
- Remove `Alert` from the React Native import (line 6) if it's only used by handleReset
- Remove `resetData, initStore` from store import (line 6) — these will be imported in the new data-management screen

Check: `Alert` is only used in `handleReset`. `resetData` and `initStore` are only used in `handleReset`. Remove them.

- [ ] **Step 2: Clean up imports**

Line 6 change:
```tsx
import { getData, updateData, resetData, initStore } from "../../lib/store";
```
to:
```tsx
import { getData, updateData } from "../../lib/store";
```

Line 2 change:
```tsx
import { View, Text, Pressable, ScrollView, TextInput, Alert, KeyboardAvoidingView, Platform } from "react-native";
```
to:
```tsx
import { View, Text, Pressable, ScrollView, TextInput, KeyboardAvoidingView, Platform } from "react-native";
```

- [ ] **Step 3: Commit**

```bash
git add app/(tabs)/settings.tsx
git commit -m "fix: remove broken reset-all-data from settings"
```

---

### Task 11: Fix preset duration validation (on blur only)

**Files:**
- Modify: `components/PresetEditor.tsx:54-67`

The current implementation already validates on blur. The issue is that on some devices, the `min` attribute or keyboard type causes the input to reject certain keystrokes while typing. The fix is to ensure `onChangeText` stores raw text without any validation, and only `onBlur` clamps the value.

- [ ] **Step 1: Verify and clean up duration input**

Check `components/PresetEditor.tsx` lines 54-67. Current code:
```tsx
          <TextInput
            value={durationText}
            onChangeText={setDurationText}
            onBlur={() => {
              const val = Math.min(60, Math.max(1, parseInt(durationText) || 5));
              setDraft((d) => ({ ...d, duration: val }));
              setDurationText(String(val));
            }}
            keyboardType="number-pad"
            className="w-20 rounded-lg bg-muted px-3 py-2 text-sm text-foreground text-center"
            maxLength={3}
          />
```

This looks correct — `onChangeText` just stores raw text, `onBlur` validates. The issue the user reports might be that the minimum of 1 blocks typing "10" because "1" immediately gets clamped. But since validation is on blur only, this shouldn't happen.

Ensure there's no `min` prop or similar. The code looks fine. Leave as-is unless the user provides more specific reproduction steps.

- [ ] **Step 2: Commit (skip if no changes needed)**

No changes needed — the current implementation is correct. Move on.

---

## Chunk 3: Notifications (Working)

### Task 12: Install notification dependencies

**Files:**
- Modify: `package.json` (via npm)
- Modify: `app.json` (add notification plugin)

- [ ] **Step 1: Install expo-notifications**

Run:
```bash
npx expo install expo-notifications
```

- [ ] **Step 2: Add expo-notifications plugin to app.json**

In `app.json`, add to the `plugins` array:
```json
[
  "expo-notifications",
  {
    "sounds": []
  }
]
```

- [ ] **Step 3: Commit**

```bash
git add package.json app.json
git commit -m "chore: install expo-notifications"
```

---

### Task 13: Create notifications utility

**Files:**
- Create: `lib/notifications.ts`

- [ ] **Step 1: Create lib/notifications.ts**

```tsx
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { ReminderSettings } from "./types";

// Configure how notifications appear when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

export async function scheduleReminders(reminders: ReminderSettings): Promise<void> {
  // Cancel all existing scheduled notifications
  await Notifications.cancelAllScheduledNotificationsAsync();

  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return;

  if (reminders.morningEnabled && reminders.morningTime) {
    const [hour, minute] = reminders.morningTime.split(":").map(Number);
    if (!isNaN(hour) && !isNaN(minute)) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Time to sit",
          body: "Your morning practice awaits.",
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour,
          minute,
        },
      });
    }
  }

  if (reminders.eveningEnabled && reminders.eveningTime) {
    const [hour, minute] = reminders.eveningTime.split(":").map(Number);
    if (!isNaN(hour) && !isNaN(minute)) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Evening check-in",
          body: "Have you sat today?",
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour,
          minute,
        },
      });
    }
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/notifications.ts
git commit -m "feat: add notification scheduling utility"
```

---

### Task 14: Install @react-native-community/datetimepicker + create TimePicker component

**Files:**
- Modify: `package.json` (via npm)
- Create: `components/TimePicker.tsx`

- [ ] **Step 1: Install datetimepicker**

Run:
```bash
npx expo install @react-native-community/datetimepicker
```

- [ ] **Step 2: Create components/TimePicker.tsx**

```tsx
import { useState } from "react";
import { Pressable, Text, Platform } from "react-native";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { colors } from "../constants/theme";

interface TimePickerProps {
  value: string; // "HH:MM"
  onChange: (time: string) => void;
}

export function TimePicker({ value, onChange }: TimePickerProps) {
  const [show, setShow] = useState(false);

  const [hours, minutes] = (value || "07:30").split(":").map(Number);
  const date = new Date();
  date.setHours(hours || 7, minutes || 30, 0, 0);

  const handleChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === "android") setShow(false);
    if (selectedDate) {
      const h = String(selectedDate.getHours()).padStart(2, "0");
      const m = String(selectedDate.getMinutes()).padStart(2, "0");
      onChange(`${h}:${m}`);
    }
  };

  return (
    <>
      <Pressable onPress={() => setShow(true)}>
        <Text
          style={{ fontFamily: "JetBrainsMono_400Regular" }}
          className="text-sm text-accent"
        >
          {value || "07:30"}
        </Text>
      </Pressable>
      {show && (
        <DateTimePicker
          value={date}
          mode="time"
          is24Hour={true}
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleChange}
          themeVariant="dark"
        />
      )}
    </>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/TimePicker.tsx package.json
git commit -m "feat: add native TimePicker component"
```

---

### Task 15: Wire notifications into Settings screen

**Files:**
- Modify: `app/(tabs)/settings.tsx`

- [ ] **Step 1: Import TimePicker and scheduleReminders**

Add imports at the top of `app/(tabs)/settings.tsx`:
```tsx
import { TimePicker } from "../../components/TimePicker";
import { scheduleReminders } from "../../lib/notifications";
```

- [ ] **Step 2: Replace morning/evening time TextInputs with TimePicker**

Replace the morning time row (the TextInput inside the `{reminders.morningEnabled && (` block):
```tsx
            {reminders.morningEnabled && (
              <Row>
                <Text className="text-sm text-foreground">Time</Text>
                <TextInput
                  value={reminders.morningTime}
                  onChangeText={(v) => setReminders((r) => ({ ...r, morningTime: v }))}
                  className="text-right text-sm text-accent"
                  placeholder="07:30"
                  placeholderTextColor={colors.mutedForeground}
                />
              </Row>
            )}
```
with:
```tsx
            {reminders.morningEnabled && (
              <Row>
                <Text className="text-sm text-foreground">Time</Text>
                <TimePicker
                  value={reminders.morningTime}
                  onChange={(v) => setReminders((r) => ({ ...r, morningTime: v }))}
                />
              </Row>
            )}
```

Do the same for evening time row — replace its TextInput with TimePicker:
```tsx
            {reminders.eveningEnabled && (
              <Row>
                <Text className="text-sm text-foreground">Time</Text>
                <TimePicker
                  value={reminders.eveningTime}
                  onChange={(v) => setReminders((r) => ({ ...r, eveningTime: v }))}
                />
              </Row>
            )}
```

- [ ] **Step 3: Schedule notifications on reminder change**

In the auto-save `useEffect` (lines 34-40), add notification scheduling:
```tsx
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    updateData((d) => ({ ...d, settings, presets, reminders, morningCommitmentTime: commitment }));
    scheduleReminders(reminders);
  }, [settings, presets, reminders, commitment]);
```

- [ ] **Step 4: Schedule notifications on app startup**

In `app/_layout.tsx` (root layout), add notification setup on mount. Import and call in a useEffect:
```tsx
import { scheduleReminders } from "../lib/notifications";
import { getData } from "../lib/store";

// Inside the component, after store init:
useEffect(() => {
  if (storeReady) {
    const data = getData();
    scheduleReminders(data.reminders);
  }
}, [storeReady]);
```

This requires reading the root layout first to find where `storeReady` is set. Check `app/_layout.tsx` for the appropriate hook point.

- [ ] **Step 5: Commit**

```bash
git add app/(tabs)/settings.tsx app/_layout.tsx
git commit -m "feat: wire native time picker and working notifications"
```

---

## Chunk 4: Data Export/Import + History Drill-down

### Task 16: Install file system dependencies

- [ ] **Step 1: Install dependencies**

Run:
```bash
npx expo install expo-sharing expo-file-system expo-document-picker
```

- [ ] **Step 2: Commit**

```bash
git add package.json
git commit -m "chore: install expo-sharing, expo-file-system, expo-document-picker"
```

---

### Task 17: Create data management screen

**Files:**
- Create: `app/data-management.tsx`

- [ ] **Step 1: Create the data management screen**

```tsx
import { useState } from "react";
import { View, Text, Pressable, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ArrowLeft, Download, Upload, Trash2 } from "lucide-react-native";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as DocumentPicker from "expo-document-picker";
import { getData, updateData, resetData, initStore } from "../lib/store";
import { NoiseBackground } from "../components/NoiseBackground";
import { Section } from "../components/Section";
import { colors } from "../constants/theme";

export default function DataManagementScreen() {
  const [status, setStatus] = useState<string | null>(null);

  const handleExport = async () => {
    try {
      const data = getData();
      const json = JSON.stringify(data, null, 2);
      const fileUri = FileSystem.documentDirectory + "sit-backup.json";
      await FileSystem.writeAsStringAsync(fileUri, json, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      await Sharing.shareAsync(fileUri, {
        mimeType: "application/json",
        dialogTitle: "Export Sit data",
      });
      setStatus("Data exported successfully");
    } catch (e) {
      setStatus("Export failed");
    }
  };

  const handleImport = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/json",
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;

      const file = result.assets[0];
      const content = await FileSystem.readAsStringAsync(file.uri);
      const imported = JSON.parse(content);

      // Basic validation
      if (!imported.sessions || !imported.dayRecords || !imported.settings) {
        Alert.alert("Invalid file", "This doesn't look like a Sit backup file.");
        return;
      }

      Alert.alert(
        "Import data",
        "This will replace all your current data. Continue?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Import",
            onPress: async () => {
              await updateData(() => imported);
              setStatus("Data imported successfully");
            },
          },
        ]
      );
    } catch (e) {
      setStatus("Import failed — invalid file");
    }
  };

  const handleErase = () => {
    Alert.alert(
      "Erase all data",
      "Are you sure? This will permanently delete all your meditation history, streaks, and settings. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Erase everything",
          style: "destructive",
          onPress: async () => {
            await resetData();
            await initStore();
            setStatus("All data erased");
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "bottom", "left", "right"]}>
      <NoiseBackground />
      <View className="flex-1 px-6" style={{ paddingTop: 16 }}>
        <Pressable
          onPress={() => router.back()}
          className="flex-row items-center gap-1 mb-6"
        >
          <ArrowLeft color={colors.mutedForeground} size={16} />
          <Text className="text-sm text-muted-foreground">Back</Text>
        </Pressable>

        <Text
          className="text-foreground mb-6"
          style={{ fontFamily: "PlayfairDisplay_600SemiBold", fontSize: 24 }}
        >
          Manage Data
        </Text>

        <Section title="Backup">
          <Pressable
            onPress={handleExport}
            className="flex-row items-center gap-3 rounded-2xl bg-card px-5 py-4 active:bg-muted"
          >
            <Download color={colors.accent} size={18} />
            <View>
              <Text className="text-sm text-foreground">Export data</Text>
              <Text className="text-xs text-muted-foreground">Save a JSON backup of all your data</Text>
            </View>
          </Pressable>

          <Pressable
            onPress={handleImport}
            className="flex-row items-center gap-3 rounded-2xl bg-card px-5 py-4 active:bg-muted"
          >
            <Upload color={colors.accent} size={18} />
            <View>
              <Text className="text-sm text-foreground">Import data</Text>
              <Text className="text-xs text-muted-foreground">Restore from a backup file</Text>
            </View>
          </Pressable>
        </Section>

        <Section title="Danger zone">
          <Pressable
            onPress={handleErase}
            className="flex-row items-center gap-3 rounded-2xl bg-card px-5 py-4 active:bg-muted"
          >
            <Trash2 color={colors.destructive} size={18} />
            <View>
              <Text className="text-sm text-destructive">Erase all data</Text>
              <Text className="text-xs text-muted-foreground">Permanently delete everything</Text>
            </View>
          </Pressable>
        </Section>

        {status && (
          <Text className="mt-4 text-center text-sm text-muted-foreground">{status}</Text>
        )}
      </View>
    </SafeAreaView>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/data-management.tsx
git commit -m "feat: add data management screen with export/import/erase"
```

---

### Task 18: Add navigation to data management from Calendar

**Files:**
- Modify: `app/(tabs)/calendar.tsx`

- [ ] **Step 1: Add a "Manage Data" link at the bottom of the calendar screen**

In `app/(tabs)/calendar.tsx`, add the import:
```tsx
import { router } from "expo-router";
```

Note: `useFocusEffect` is already imported from expo-router, but `router` may not be. Check and add if needed.

At the bottom of the calendar view, after the streak cards `</View>` (after line 185), add:
```tsx
        {/* Data management link */}
        <Pressable
          onPress={() => router.push("/data-management")}
          className="items-center py-4"
        >
          <Text className="text-sm text-muted-foreground underline">Manage Data</Text>
        </Pressable>
```

- [ ] **Step 2: Commit**

```bash
git add app/(tabs)/calendar.tsx
git commit -m "feat: add manage-data link in calendar screen"
```

---

## Chunk 5: Stats & Calendar Card Unification

### Task 19: Redesign StatCard for unified layout

**Files:**
- Modify: `components/StatCard.tsx`

- [ ] **Step 1: Redesign StatCard with icon top-left, centered KPI, subtitle below**

Replace the entire `components/StatCard.tsx`:
```tsx
import { View, Text } from "react-native";

const CARD_BG = "rgba(26, 26, 26, 0.50)";
const CARD_SHADOW = {
  shadowColor: "#fff",
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.06,
  shadowRadius: 14,
  elevation: 4,
} as const;

interface StatCardProps {
  icon: React.ReactNode;
  value: number | string;
  label: string;
}

export function StatCard({ icon, value, label }: StatCardProps) {
  return (
    <View
      className="flex-1 rounded-2xl p-4"
      style={{ backgroundColor: CARD_BG, ...CARD_SHADOW }}
    >
      <View className="mb-2">{icon}</View>
      <View className="items-center">
        <Text
          className="text-3xl text-foreground"
          style={{ fontFamily: "JetBrainsMono_400Regular" }}
        >
          {value}
        </Text>
        <Text className="mt-1 text-[11px] text-muted-foreground">{label}</Text>
      </View>
    </View>
  );
}
```

Key changes:
- `CARD_BG` is now `rgba(26, 26, 26, 0.50)` (50% transparent as requested)
- Icon stays top-left (`mb-2`)
- Value is centered and larger (`text-3xl`)
- Label centered below value
- `value` accepts `string | number` for flexibility

- [ ] **Step 2: Commit**

```bash
git add components/StatCard.tsx
git commit -m "feat: redesign StatCard with centered KPI layout and transparent bg"
```

---

### Task 20: Update Stats screen to use unified StatCard for all cards

**Files:**
- Modify: `app/(tabs)/stats.tsx`

- [ ] **Step 1: Replace inline bottom cards with StatCard**

In `app/(tabs)/stats.tsx`, the top 6 cards already use StatCard. The bottom 2 ("days meditated" and "avg. minutes") use inline styles. Also need to add icons for those.

Add `Calendar as CalendarIcon` and `TrendingUp` to the lucide import:
```tsx
import { Flame, Clock, Sun, Moon, Target, Award, Calendar as CalendarIcon, TrendingUp } from "lucide-react-native";
```

Replace the "Extra stats" section (lines 66-85):
```tsx
        {/* Extra stats */}
        <View className="flex-row gap-3">
          <View
            className="flex-1 rounded-2xl p-4 items-center"
            style={{ backgroundColor: CARD_BG, ...CARD_SHADOW }}
          >
            <Text className="text-2xl text-foreground" style={{ fontFamily: "JetBrainsMono_400Regular" }}>
              {stats.totalDaysMeditated}
            </Text>
            <Text className="mt-1 text-[11px] text-muted-foreground">days meditated</Text>
          </View>
          <View
            className="flex-1 rounded-2xl p-4 items-center"
            style={{ backgroundColor: CARD_BG, ...CARD_SHADOW }}
          >
            <Text className="text-2xl text-foreground" style={{ fontFamily: "JetBrainsMono_400Regular" }}>
              {stats.averageSessionMinutes}
            </Text>
            <Text className="mt-1 text-[11px] text-muted-foreground">avg. minutes</Text>
          </View>
        </View>
```
with:
```tsx
        {/* Extra stats */}
        <View className="flex-row gap-3">
          <StatCard icon={<CalendarIcon color={colors.mutedForeground} size={16} />} value={stats.totalDaysMeditated} label="days meditated" />
          <StatCard icon={<TrendingUp color={colors.mutedForeground} size={16} />} value={stats.averageSessionMinutes} label="avg. minutes" />
        </View>
```

- [ ] **Step 2: Remove unused CARD_BG and CARD_SHADOW from stats.tsx**

Delete lines 13-19 from `app/(tabs)/stats.tsx`:
```tsx
const CARD_BG = "#1a1a1a";
const CARD_SHADOW = {
  shadowColor: "#fff",
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.06,
  shadowRadius: 14,
  elevation: 4,
} as const;
```

BUT — the weekly chart card still uses `CARD_BG` and `CARD_SHADOW` (line 89-91). Update the weekly chart to use the same transparent bg:
```tsx
        <View
          className="rounded-2xl p-5"
          style={{ backgroundColor: "rgba(26, 26, 26, 0.50)", shadowColor: "#fff", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.06, shadowRadius: 14, elevation: 4 }}
        >
```

Or simply keep `CARD_BG` and `CARD_SHADOW` but update `CARD_BG` to match:
```tsx
const CARD_BG = "rgba(26, 26, 26, 0.50)";
```

That's cleaner. Just change the CARD_BG value.

- [ ] **Step 3: Commit**

```bash
git add app/(tabs)/stats.tsx
git commit -m "feat: unify all stats cards with StatCard component"
```

---

### Task 21: Update Calendar cards to match Stats style

**Files:**
- Modify: `app/(tabs)/calendar.tsx`

- [ ] **Step 1: Import StatCard and icons**

Add to `app/(tabs)/calendar.tsx` imports:
```tsx
import { Flame, Award } from "lucide-react-native";
import { StatCard } from "../../components/StatCard";
```

- [ ] **Step 2: Update CARD_BG to match**

Change line 14:
```tsx
const CARD_BG = "#1a1a1a";
```
to:
```tsx
const CARD_BG = "rgba(26, 26, 26, 0.50)";
```

- [ ] **Step 3: Replace streak cards with StatCard**

Replace the streak cards section (lines 160-185):
```tsx
        {/* Streak cards */}
        <View className="flex-row gap-3">
          <View
            className="flex-1 rounded-2xl p-4 items-center"
            style={{ backgroundColor: CARD_BG, ...CARD_SHADOW }}
          >
            <Text
              className="text-2xl text-foreground"
              style={{ fontFamily: "JetBrainsMono_400Regular" }}
            >
              {data.streak.currentDailyStreak}
            </Text>
            <Text className="mt-1 text-[11px] text-muted-foreground">current streak</Text>
          </View>
          <View
            className="flex-1 rounded-2xl p-4 items-center"
            style={{ backgroundColor: CARD_BG, ...CARD_SHADOW }}
          >
            <Text
              className="text-2xl text-foreground"
              style={{ fontFamily: "JetBrainsMono_400Regular" }}
            >
              {data.streak.longestDailyStreak}
            </Text>
            <Text className="mt-1 text-[11px] text-muted-foreground">longest streak</Text>
          </View>
        </View>
```
with:
```tsx
        {/* Streak cards */}
        <View className="flex-row gap-3">
          <StatCard icon={<Flame color={colors.accent} size={16} />} value={data.streak.currentDailyStreak} label="current streak" />
          <StatCard icon={<Award color={colors.mutedForeground} size={16} />} value={data.streak.longestDailyStreak} label="longest streak" />
        </View>
```

- [ ] **Step 4: Update selected day detail card to use same visual style**

Replace the selected day detail card styling (lines 129-130):
```tsx
          <View
            className="rounded-2xl px-5 py-4"
            style={{ backgroundColor: CARD_BG, ...CARD_SHADOW }}
          >
```
This already uses `CARD_BG` and `CARD_SHADOW`, so updating `CARD_BG` to the transparent version will automatically apply.

- [ ] **Step 5: Commit**

```bash
git add app/(tabs)/calendar.tsx
git commit -m "feat: unify calendar cards with stats card style"
```

---

## Chunk 6: App Icon + Screen Block

### Task 22: Change app icon to orange enso

**Files:**
- Modify: `assets/images/icon.png`
- Modify: `assets/images/android-icon-foreground.png`
- Modify: `assets/images/splash-icon.png`

**Note:** This task requires generating PNG images from the enso SVG with the accent color (#cc8c28) on dark background (#0a0a0a). This cannot be done purely in code.

- [ ] **Step 1: Create icon generation script**

Create a Node.js script using `sharp` or `@resvg/resvg-js` to convert the SVG to PNGs at required sizes:

```bash
npm install --save-dev @resvg/resvg-js
```

Create `scripts/generate-icons.js`:
```js
const { Resvg } = require("@resvg/resvg-js");
const fs = require("fs");
const path = require("path");

const svgPath = path.join(__dirname, "../assets/images/enso-0.svg");
let svg = fs.readFileSync(svgPath, "utf8");

// Replace currentColor with accent color
svg = svg.replace(/currentColor/g, "#cc8c28");

const sizes = [
  { name: "icon.png", size: 1024, padding: 100 },
  { name: "android-icon-foreground.png", size: 432, padding: 50 },
  { name: "splash-icon.png", size: 200, padding: 20 },
];

for (const { name, size, padding } of sizes) {
  const wrappedSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <rect width="${size}" height="${size}" fill="#0a0a0a"/>
    <g transform="translate(${padding}, ${padding})">
      <svg width="${size - padding * 2}" height="${size - padding * 2}" viewBox="0 0 240 240">
        ${svg.replace(/<\/?svg[^>]*>/g, "")}
      </svg>
    </g>
  </svg>`;

  const resvg = new Resvg(wrappedSvg, { fitTo: { mode: "width", value: size } });
  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();
  fs.writeFileSync(path.join(__dirname, "../assets/images", name), pngBuffer);
  console.log(`Generated ${name} (${size}x${size})`);
}
```

- [ ] **Step 2: Run the script**

```bash
node scripts/generate-icons.js
```

Verify the generated icons look correct (orange enso on dark background).

- [ ] **Step 3: Commit**

```bash
git add assets/images/icon.png assets/images/android-icon-foreground.png assets/images/splash-icon.png scripts/generate-icons.js
git commit -m "feat: change app icon to orange enso"
```

---

### Task 23: Implement screen block (immersive mode) during active session

**Files:**
- Create: `lib/screenBlock.ts`
- Modify: `app/active-session.tsx`
- Modify: `app.json` (for Android permissions)

- [ ] **Step 1: Install react-native-immersive-mode or expo equivalent**

For Expo managed workflow, the simplest approach is to use the StatusBar API and NavigationBar API:

```bash
npx expo install expo-navigation-bar expo-status-bar
```

(`expo-status-bar` is likely already installed with Expo.)

- [ ] **Step 2: Create lib/screenBlock.ts**

```tsx
import { Platform } from "react-native";
import * as NavigationBar from "expo-navigation-bar";
import { StatusBar } from "expo-status-bar";

export async function enableScreenBlock(): Promise<void> {
  if (Platform.OS === "android") {
    await NavigationBar.setVisibilityAsync("hidden");
    await NavigationBar.setBehaviorAsync("overlay-swipe");
  }
  // StatusBar is handled via component in the screen
}

export async function disableScreenBlock(): Promise<void> {
  if (Platform.OS === "android") {
    await NavigationBar.setVisibilityAsync("visible");
  }
}
```

- [ ] **Step 3: Wire into active-session.tsx**

In `app/active-session.tsx`, add imports:
```tsx
import { enableScreenBlock, disableScreenBlock } from "../lib/screenBlock";
import { StatusBar } from "expo-status-bar";
```

Add useEffect for screen blocking:
```tsx
  useEffect(() => {
    enableScreenBlock();
    return () => {
      disableScreenBlock();
    };
  }, []);
```

Add `<StatusBar hidden />` at the top of both return JSX blocks (warmup and session).

Update `handleFinish` and `handleDiscard` to call `disableScreenBlock()` before navigation:
```tsx
  const handleFinish = async (elapsedSecs: number) => {
    await disableScreenBlock();
    const elapsedMinutes = Math.floor(elapsedSecs / 60);
    await recordSession(elapsedMinutes, elapsedSecs, config);
    router.replace({
      pathname: "/session-complete",
      params: { minutes: String(elapsedMinutes), seconds: String(elapsedSecs) },
    });
  };

  const handleDiscard = async () => {
    await disableScreenBlock();
    router.replace("/(tabs)");
  };
```

- [ ] **Step 4: Commit**

```bash
git add lib/screenBlock.ts app/active-session.tsx package.json
git commit -m "feat: immersive screen blocking during active session"
```

---

## Chunk 7: Tests

### Task 24: Set up test infrastructure

**Files:**
- Check `package.json` for existing test setup

- [ ] **Step 1: Check existing test setup**

The project has Playwright e2e tests in `e2e/`. For unit tests, check if Jest is configured. If not:

```bash
npx expo install jest-expo -- --dev
npm install --save-dev @testing-library/react-native @testing-library/jest-native
```

Add to `package.json`:
```json
{
  "scripts": {
    "test": "jest"
  },
  "jest": {
    "preset": "jest-expo",
    "transformIgnorePatterns": [
      "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg)"
    ]
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add package.json
git commit -m "chore: set up jest for unit testing"
```

---

### Task 25: Write tests for session recording logic

**Files:**
- Create: `lib/__tests__/store.test.ts`

- [ ] **Step 1: Write tests**

```tsx
import AsyncStorage from "@react-native-async-storage/async-storage";

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

import { initStore, getData, recordSession, resetData } from "../store";
import { TimerConfig } from "../types";

const defaultConfig: TimerConfig = {
  duration: 10,
  startBell: "Root Chakra",
  endBell: "Root Chakra",
  intervalBells: false,
  intervalMinutes: 7,
  ambientSound: null,
};

describe("store", () => {
  beforeEach(async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
    await resetData();
    await initStore();
  });

  test("initializes with seed data", () => {
    const data = getData();
    expect(data.sessions.length).toBeGreaterThan(0);
    expect(data.presets.length).toBe(3);
    expect(data.settings.minimumSitMinutes).toBe(5);
  });

  test("records a session and marks qualified", async () => {
    const session = await recordSession(10, 600, defaultConfig);
    expect(session.qualifiedForDayCredit).toBe(true);
    expect(session.durationMinutes).toBe(10);
  });

  test("sessions under minimumSitMinutes are not qualified", async () => {
    const shortConfig = { ...defaultConfig, duration: 3 };
    const session = await recordSession(3, 180, shortConfig);
    expect(session.qualifiedForDayCredit).toBe(false);
  });

  test("sessions under 5 min do not count toward streak", async () => {
    const data = getData();
    const streakBefore = data.streak.currentDailyStreak;
    await recordSession(3, 180, { ...defaultConfig, duration: 3 });
    const dataAfter = getData();
    // Streak should not increase for unqualified session
    expect(dataAfter.streak.currentDailyStreak).toBe(streakBefore);
  });
});
```

- [ ] **Step 2: Run tests**

```bash
npm test -- --testPathPattern="store.test"
```

Expected: All tests pass.

- [ ] **Step 3: Commit**

```bash
git add lib/__tests__/store.test.ts
git commit -m "test: add unit tests for session recording logic"
```

---

### Task 26: Write tests for notification scheduling

**Files:**
- Create: `lib/__tests__/notifications.test.ts`

- [ ] **Step 1: Write tests**

```tsx
jest.mock("expo-notifications", () => ({
  getPermissionsAsync: jest.fn(() => Promise.resolve({ status: "granted" })),
  requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: "granted" })),
  cancelAllScheduledNotificationsAsync: jest.fn(() => Promise.resolve()),
  scheduleNotificationAsync: jest.fn(() => Promise.resolve("id")),
  setNotificationHandler: jest.fn(),
  SchedulableTriggerInputTypes: { DAILY: "daily" },
}));

import * as Notifications from "expo-notifications";
import { scheduleReminders } from "../notifications";

describe("notifications", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("schedules morning notification when enabled", async () => {
    await scheduleReminders({
      morningEnabled: true,
      morningTime: "07:30",
      eveningEnabled: false,
      eveningTime: "21:00",
    });

    expect(Notifications.cancelAllScheduledNotificationsAsync).toHaveBeenCalled();
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(1);
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.objectContaining({ title: "Time to sit" }),
        trigger: expect.objectContaining({ hour: 7, minute: 30 }),
      })
    );
  });

  test("schedules both notifications when both enabled", async () => {
    await scheduleReminders({
      morningEnabled: true,
      morningTime: "07:30",
      eveningEnabled: true,
      eveningTime: "21:00",
    });

    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(2);
  });

  test("cancels all and schedules none when both disabled", async () => {
    await scheduleReminders({
      morningEnabled: false,
      morningTime: "07:30",
      eveningEnabled: false,
      eveningTime: "21:00",
    });

    expect(Notifications.cancelAllScheduledNotificationsAsync).toHaveBeenCalled();
    expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run tests**

```bash
npm test -- --testPathPattern="notifications.test"
```

- [ ] **Step 3: Commit**

```bash
git add lib/__tests__/notifications.test.ts
git commit -m "test: add unit tests for notification scheduling"
```

---

### Task 27: Write tests for last session dot logic

**Files:**
- Create: `lib/__tests__/lastSessionDot.test.ts`

- [ ] **Step 1: Write logic tests**

This tests the dot color determination logic that will be used in the home screen:

```tsx
describe("last session dot logic", () => {
  function getDotColor(
    hasSatToday: boolean,
    qualifiedForDayCredit: boolean,
    lastSessionTime: string // "today" | "yesterday" | date string
  ): "green" | "red" | "none" {
    const showGreen = qualifiedForDayCredit && lastSessionTime === "today";
    const showRed = !hasSatToday && lastSessionTime === "yesterday";
    if (showGreen) return "green";
    if (showRed) return "red";
    return "none";
  }

  test("green dot when qualified session today", () => {
    expect(getDotColor(true, true, "today")).toBe("green");
  });

  test("red dot when last session was yesterday and no session today", () => {
    expect(getDotColor(false, true, "yesterday")).toBe("red");
  });

  test("no dot for unqualified session today", () => {
    expect(getDotColor(false, false, "today")).toBe("none");
  });

  test("no dot for old sessions", () => {
    expect(getDotColor(false, true, "Mar 5")).toBe("none");
  });

  test("no dot when sat today but last session was yesterday", () => {
    // This case means the last session in the array is from yesterday
    // but user HAS sat today (so hasSatToday is true from a different session)
    expect(getDotColor(true, true, "yesterday")).toBe("none");
  });
});
```

- [ ] **Step 2: Run tests**

```bash
npm test -- --testPathPattern="lastSessionDot.test"
```

- [ ] **Step 3: Commit**

```bash
git add lib/__tests__/lastSessionDot.test.ts
git commit -m "test: add tests for last session dot color logic"
```

---

### Task 28: Update E2E tests for changed UI

**Files:**
- Modify: `e2e/app.spec.ts`

- [ ] **Step 1: Review existing E2E tests**

Read `e2e/app.spec.ts` and identify tests that need updating:
- Preset button behavior (now selects instead of starting)
- Settings screen (no more "Reset all data" section)
- Any tests checking for green enso

- [ ] **Step 2: Update affected tests**

Update tests to match new behavior. This depends on the specific test content. Key changes:
- Remove assertions about "Reset all data" button
- Update preset interaction tests (tap preset → check visual selection, not navigation)
- Remove checks for green enso color

- [ ] **Step 3: Run E2E tests**

```bash
npx playwright test
```

- [ ] **Step 4: Commit**

```bash
git add e2e/app.spec.ts
git commit -m "test: update e2e tests for UI changes"
```

---

## Summary of all files touched

**Created:**
- `lib/notifications.ts`
- `components/TimePicker.tsx`
- `app/data-management.tsx`
- `lib/screenBlock.ts`
- `scripts/generate-icons.js`
- `lib/__tests__/store.test.ts`
- `lib/__tests__/notifications.test.ts`
- `lib/__tests__/lastSessionDot.test.ts`

**Modified:**
- `components/HamburgerButton.tsx` — lower position
- `components/EnsoButton.tsx` — remove glow
- `components/GlassCard.tsx` — more transparent
- `components/StatCard.tsx` — redesign layout
- `app/(tabs)/index.tsx` — enso never green, preset select behavior, last session dot logic
- `app/(tabs)/settings.tsx` — remove reset, editable min sit, native time picker, notifications
- `app/(tabs)/stats.tsx` — unified cards
- `app/(tabs)/calendar.tsx` — unified cards, data management link
- `app/active-session.tsx` — less prominent buttons, screen blocking
- `app/_layout.tsx` — notification init on startup
- `lib/store.ts` — default min sit to 5
- `app.json` — expo-notifications plugin
- `package.json` — new dependencies
- `e2e/app.spec.ts` — updated tests

**New dependencies:**
- `expo-notifications`
- `@react-native-community/datetimepicker`
- `expo-sharing`
- `expo-file-system`
- `expo-document-picker`
- `expo-navigation-bar`
- `jest-expo` (dev)
- `@testing-library/react-native` (dev)
- `@resvg/resvg-js` (dev)
