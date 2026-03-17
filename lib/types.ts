export interface Session {
  id: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  durationSeconds: number;
  completed: boolean;
  qualifiedForDayCredit: boolean;
  sessionType: 'morning' | 'evening' | 'other';
  notes?: string;
  timerPresetUsed: number;
  bellsUsed: { start: string; end: string; interval: boolean };
}

export interface DayRecord {
  date: string; // YYYY-MM-DD
  totalMinutes: number;
  totalSessions: number;
  qualified: boolean;
  firstSessionTime?: string;
  lastSessionTime?: string;
}

export interface StreakState {
  currentDailyStreak: number;
  longestDailyStreak: number;
  currentWeekCount: number;
  weeklyGoal: number;
  longestWeeklyCompletionRun: number;
}

export interface ReminderSettings {
  morningEnabled: boolean;
  morningTime: string;
  eveningEnabled: boolean;
  eveningTime: string;
}

export interface UserSettings {
  minimumSitMinutes: number;
  defaultQuickStartMinutes: number;
  preferredStartBell: string;
  preferredEndBell: string;
  intervalBellsEnabled: boolean;
  preferredTheme: string;
  weeklyGoal: number;
  quickStartPresets: number[];
  warmUpEnabled: boolean;
  warmUpSeconds: number;
  screenLockEnabled: boolean;
}

export interface StatsSummary {
  totalMinutes: number;
  totalSessions: number;
  totalDaysMeditated: number;
  averageSessionMinutes: number;
  morningSessions: number;
  eveningSessions: number;
}

export interface TimerConfig {
  duration: number; // minutes
  startBell: string;
  endBell: string;
  intervalBells: boolean;
  intervalMinutes: number;
  ambientSound: string | null;
}

export interface Preset {
  id: string;
  name: string;
  duration: number;
  startBell: string;
  endBell: string;
  intervalBells: boolean;
  intervalMinutes: number;
  ambientSound: string | null;
  quickStart: boolean; // show on home screen (max 3)
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  achieved: boolean;
  achievedDate?: string;
}

export interface BlockedApp {
  name: string;
  packageName: string;
}

export interface MorningBlockSettings {
  enabled: boolean;
  startTime: string;
  endTime: string;
  dismissMode: "gentle" | "firm";
  blockedApps: BlockedApp[];
  unlockedToday: boolean;
}
