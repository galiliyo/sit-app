# Morning Block — Design Spec

Replace morning doomscrolling with meditation by blocking distracting apps until you sit.

## Summary

A native Android feature that detects when the user opens a blocked app during a configurable morning window and displays a full-screen overlay encouraging them to meditate. The block lifts when the user completes a meditation session in Sit, or at a hard cutoff time.

## Decisions Made

- **Blocking mechanism:** Android Accessibility Service + System Overlay (SYSTEM_ALERT_WINDOW)
- **Scope:** Selective blocking — only specified apps, not the entire phone
- **Block window:** Automatic start time, lifts on meditation completion or hard cutoff
- **Dismiss mode:** Two options — "Gentle" (tap to dismiss) or "Firm" (type a phrase to dismiss)
- **Block screen style:** Minimal zen — enso circle, "Be still" message, green dot with streak count, "Open Sit" button
- **Platform:** Android only (iOS doesn't allow third-party app blocking)

## Architecture

### Layer 1: Native Android Module (`MorningBlockModule`)

A custom Expo module written in Kotlin with two components:

**AccessibilityService:**
- Monitors `TYPE_WINDOW_STATE_CHANGED` events to detect foreground app changes
- Compares the foreground app's package name against the blocked apps list
- Checks if current time falls within the active block window
- Checks if the user has already meditated today (block lifted for the day)
- If all conditions met → triggers the overlay

**System Overlay:**
- Uses `SYSTEM_ALERT_WINDOW` permission to draw on top of other apps
- Renders the block screen UI (enso circle, message, streak, CTA button)
- In "Gentle" mode: single tap on dismiss area closes the overlay
- In "Firm" mode: shows a text input with a random phrase the user must type exactly to dismiss
- "Open Sit" button launches the Sit app via deep link

**Native module bridge methods:**
- `configure(config)` — receives block settings from JS (times, app list, enabled, dismiss mode)
- `unlockForToday()` — called after meditation completion, disables blocking until next day
- `isAccessibilityEnabled()` — checks if the user has granted accessibility permission
- `openAccessibilitySettings()` — deep links to Android accessibility settings
- `isOverlayEnabled()` — checks overlay permission status
- `requestOverlayPermission()` — triggers the system permission dialog

### Layer 2: Expo Config Plugin

A config plugin that modifies the Android build:

- Adds `SYSTEM_ALERT_WINDOW` permission to `AndroidManifest.xml`
- Declares the `AccessibilityService` in the manifest with the required intent filter
- Generates `accessibility_service_config.xml` with:
  - `accessibilityEventTypes="typeWindowStateChanged"`
  - `accessibilityFeedbackType="feedbackGeneric"`
  - `canRetrieveWindowContent="false"`
  - `notificationTimeout="100"`

Registered in `app.json` plugins array.

### Layer 3: React Native JS Layer

**Store additions** (`lib/store.ts`):

```typescript
interface MorningBlockSettings {
  enabled: boolean
  startTime: string          // "06:00"
  endTime: string            // "09:00"
  dismissMode: 'gentle' | 'firm'
  blockedApps: BlockedApp[]
  unlockedToday: boolean     // reset daily
}

interface BlockedApp {
  name: string               // display name
  packageName: string        // e.g. "com.instagram.android"
}
```

**Default blocked apps:**
| App | Package Name |
|-----|-------------|
| Instagram | `com.instagram.android` |
| Twitter/X | `com.twitter.android` |
| Reddit | `com.reddit.frontpage` |
| TikTok | `com.zhiliaoapp.musically` |
| YouTube | `com.google.android.youtube` |
| Telegram | `org.telegram.messenger` |
| Chrome (for Ynet/Haaretz) | `com.android.chrome` |

Note: Ynet and Haaretz are websites, not standalone apps. Blocking the browser during the morning window covers these. A future improvement could use a more targeted approach (VPN-based URL filtering), but browser blocking is the pragmatic v1.

**Settings UI** — new "Morning Block" section in settings tab:
- Enable/disable toggle
- Start time picker (default 06:00)
- End time / hard cutoff picker (default 09:00)
- Dismiss mode selector: Gentle / Firm
- Blocked apps list with add/remove
- First-time setup: permission guidance cards for Accessibility Service and Overlay

**Session completion hook** — in `recordSession()`:
- After recording a session, if morning block is enabled and current time is within the block window:
  - Call `MorningBlockModule.unlockForToday()`
  - Set `unlockedToday = true` in store

**Daily reset:**
- On app launch (in `initStore()`), check if the date has changed
- If new day, reset `unlockedToday = false` and re-send config to native module

## Block Screen Design

Minimal, dark, matching Sit's aesthetic:

```
┌─────────────────────────┐
│                         │
│                         │
│         ◠               │  ← Enso circle (accent color #cc8c28)
│        ╱   ╲            │
│       ╲     ╱           │
│        ╰───╯            │
│                         │
│       Be still.         │  ← DMSans light, #e8e4de
│  Your morning sit       │  ← DMSans, #e8e4de55
│     is waiting          │
│                         │
│     ● 12 day streak     │  ← Green dot #36a66e + text #e8e4de77
│                         │
│    ┌──────────────┐     │
│    │   Open Sit   │     │  ← Border #cc8c28, text #cc8c28
│    └──────────────┘     │
│                         │
│                         │
└─────────────────────────┘
```

In **Firm** mode, below the "Open Sit" button:

```
│  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─  │
│  Or type to dismiss:    │
│  "I choose to scroll"  │  ← Random phrase shown as placeholder
│  ┌───────────────────┐  │
│  │                   │  │  ← Text input
│  └───────────────────┘  │
```

**Dismiss phrases (rotated randomly):**
1. "I choose to scroll"
2. "I'll scroll instead"
3. "Not sitting today"
4. "Skip the sit"
5. "I'd rather scroll"
6. "Scrolling over sitting"
7. "More scrolling please"
8. "Still in bed"

## Permission Setup Flow

First time the user enables Morning Block in settings:

1. **Check permissions** — call `isAccessibilityEnabled()` and `isOverlayEnabled()`
2. **Show guidance card** for each missing permission:
   - Title: "Sit needs permission to block apps"
   - Explanation of what the permission does and why
   - Button to open the relevant system settings screen
3. **On return to app** — re-check permissions, show success state or retry
4. **All granted** — activate the service with current config

## Edge Cases

- **User uninstalls and reinstalls:** Accessibility permission is revoked. Settings UI should detect this and show the setup flow again.
- **Block window spans midnight:** Not supported in v1. Start time must be before end time within the same day.
- **User meditates before block window starts:** Counts as unlocked for the day if session is recorded on that calendar day.
- **Phone restart:** Accessibility Service restarts automatically (Android behavior). Config is re-read from SharedPreferences.
- **Config persistence:** Native module stores config in Android SharedPreferences (not just AsyncStorage) so the service can read it independently of the JS runtime.

## Out of Scope (v1)

- iOS support (not technically possible)
- Per-website blocking (would require VPN/DNS approach)
- Scheduling different block windows per day of week
- Gradual unlock (e.g., block fewer apps over time)
- Statistics on block attempts / dismissals
