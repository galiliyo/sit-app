import { Session, DayRecord, StreakState, UserSettings, ReminderSettings, TimerConfig, Milestone, StatsSummary, Preset } from './types';

const STORAGE_KEY = 'sit_app_data';

interface AppData {
  sessions: Session[];
  dayRecords: Record<string, DayRecord>;
  streak: StreakState;
  settings: UserSettings;
  reminders: ReminderSettings;
  milestones: Milestone[];
  morningCommitmentTime: string | null;
  presets: Preset[];
}

const defaultSettings: UserSettings = {
  minimumSitMinutes: 2,
  defaultQuickStartMinutes: 5,
  preferredStartBell: 'Kangsê',
  preferredEndBell: 'Kangsê',
  intervalBellsEnabled: false,
  preferredTheme: 'dark',
  weeklyGoal: 5,
  quickStartPresets: [5, 10, 15],
  warmUpEnabled: false,
  warmUpSeconds: 10,
};

const defaultReminders: ReminderSettings = {
  morningEnabled: true,
  morningTime: '07:30',
  eveningEnabled: false,
  eveningTime: '21:00',
};

const defaultMilestones: Milestone[] = [
  { id: 'first_sit', title: 'First Sit', description: 'You began.', achieved: false },
  { id: 'streak_3', title: '3-Day Streak', description: 'Three days in a row.', achieved: false },
  { id: 'streak_7', title: '7-Day Streak', description: 'A full week.', achieved: false },
  { id: 'streak_30', title: '30-Day Streak', description: 'A month of sitting.', achieved: false },
  { id: 'total_100', title: '100 Minutes', description: 'A hundred minutes of stillness.', achieved: false },
  { id: 'total_1000', title: '1,000 Minutes', description: 'Deep practice.', achieved: false },
  { id: 'morning_10', title: '10 Morning Sits', description: 'Building a morning rhythm.', achieved: false },
  { id: 'sessions_50', title: '50 Sessions', description: 'Fifty times you chose to sit.', achieved: false },
];

function generateSeedData(): AppData {
  const sessions: Session[] = [];
  const dayRecords: Record<string, DayRecord> = {};
  const today = new Date();

  // Generate 14 days of data, with 2 missed days
  const missedDays = new Set([5, 9]); // days ago that were missed

  for (let i = 13; i >= 0; i--) {
    if (missedDays.has(i)) continue;

    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const hour = Math.random() > 0.3 ? 7 : 20;
    const mins = Math.floor(Math.random() * 30);
    const duration = [5, 7, 10, 10, 15, 20][Math.floor(Math.random() * 6)];

    const startTime = new Date(date);
    startTime.setHours(hour, mins, 0);
    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + duration);

    const session: Session = {
      id: `seed_${i}`,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      durationMinutes: duration,
      durationSeconds: duration * 60,
      completed: true,
      qualifiedForDayCredit: true,
      sessionType: hour < 12 ? 'morning' : 'evening',
      timerPresetUsed: duration,
      bellsUsed: { start: 'Kangsê', end: 'Kangsê', interval: false },
    };
    sessions.push(session);

    dayRecords[dateStr] = {
      date: dateStr,
      totalMinutes: duration,
      totalSessions: 1,
      qualified: true,
      firstSessionTime: startTime.toISOString(),
      lastSessionTime: endTime.toISOString(),
    };
  }

  // Remove today's data so the user sees "not sat yet"
  const todayStr = today.toISOString().split('T')[0];
  delete dayRecords[todayStr];
  const todaySessionIdx = sessions.findIndex(s => s.startTime.startsWith(todayStr));
  if (todaySessionIdx >= 0) sessions.splice(todaySessionIdx, 1);

  // Calculate streak (days before today)
  let currentStreak = 0;
  for (let i = 1; i <= 30; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const ds = d.toISOString().split('T')[0];
    if (dayRecords[ds]?.qualified) {
      currentStreak++;
    } else {
      break;
    }
  }

  const qualifiedDays = Object.values(dayRecords).filter(d => d.qualified).length;
  const thisWeekStart = new Date(today);
  thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay() + 1);
  let weekCount = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date(thisWeekStart);
    d.setDate(d.getDate() + i);
    const ds = d.toISOString().split('T')[0];
    if (dayRecords[ds]?.qualified) weekCount++;
  }

  return {
    sessions,
    dayRecords,
    streak: {
      currentDailyStreak: currentStreak,
      longestDailyStreak: Math.max(currentStreak, 8),
      currentWeekCount: weekCount,
      weeklyGoal: 5,
      longestWeeklyCompletionRun: 3,
    },
    settings: defaultSettings,
    reminders: defaultReminders,
    milestones: defaultMilestones.map(m => {
      if (m.id === 'first_sit') return { ...m, achieved: true, achievedDate: sessions[0]?.startTime };
      if (m.id === 'streak_3') return { ...m, achieved: currentStreak >= 3, achievedDate: currentStreak >= 3 ? sessions[0]?.startTime : undefined };
      if (m.id === 'streak_7') return { ...m, achieved: currentStreak >= 7, achievedDate: currentStreak >= 7 ? sessions[0]?.startTime : undefined };
      if (m.id === 'total_100') {
        const total = sessions.reduce((a, s) => a + s.durationMinutes, 0);
        return { ...m, achieved: total >= 100, achievedDate: total >= 100 ? sessions[sessions.length - 1]?.startTime : undefined };
      }
      if (m.id === 'morning_10') {
        const mornings = sessions.filter(s => s.sessionType === 'morning').length;
        return { ...m, achieved: mornings >= 10 };
      }
      return m;
    }),
    morningCommitmentTime: '07:30',
  };
}

function loadData(): AppData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  const seed = generateSeedData();
  saveData(seed);
  return seed;
}

function saveData(data: AppData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Singleton store
let _data: AppData | null = null;

export function getData(): AppData {
  if (!_data) _data = loadData();
  return _data;
}

export function updateData(updater: (data: AppData) => AppData): AppData {
  const current = getData();
  _data = updater(current);
  saveData(_data);
  return _data;
}

export function getStats(): StatsSummary {
  const data = getData();
  const sessions = data.sessions;
  const totalMinutes = sessions.reduce((a, s) => a + s.durationMinutes, 0);
  return {
    totalMinutes,
    totalSessions: sessions.length,
    totalDaysMeditated: Object.values(data.dayRecords).filter(d => d.qualified).length,
    averageSessionMinutes: sessions.length ? Math.round(totalMinutes / sessions.length) : 0,
    morningSessions: sessions.filter(s => s.sessionType === 'morning').length,
    eveningSessions: sessions.filter(s => s.sessionType === 'evening').length,
  };
}

export function getTodayStr(): string {
  return new Date().toISOString().split('T')[0];
}

export function recordSession(durationMinutes: number, durationSeconds: number, config: TimerConfig): Session {
  const now = new Date();
  const startTime = new Date(now.getTime() - durationSeconds * 1000);
  const hour = startTime.getHours();
  const sessionType = hour < 12 ? 'morning' as const : hour < 17 ? 'other' as const : 'evening' as const;
  const data = getData();

  const session: Session = {
    id: `s_${Date.now()}`,
    startTime: startTime.toISOString(),
    endTime: now.toISOString(),
    durationMinutes,
    durationSeconds,
    completed: true,
    qualifiedForDayCredit: durationMinutes >= data.settings.minimumSitMinutes,
    sessionType,
    timerPresetUsed: config.duration,
    bellsUsed: { start: config.startBell, end: config.endBell, interval: config.intervalBells },
  };

  const todayStr = getTodayStr();
  const existing = data.dayRecords[todayStr];

  const dayRecord: import('./types').DayRecord = {
    date: todayStr,
    totalMinutes: (existing?.totalMinutes || 0) + durationMinutes,
    totalSessions: (existing?.totalSessions || 0) + 1,
    qualified: existing?.qualified || session.qualifiedForDayCredit,
    firstSessionTime: existing?.firstSessionTime || startTime.toISOString(),
    lastSessionTime: now.toISOString(),
  };

  // Update streak
  let newStreak = data.streak.currentDailyStreak;
  if (session.qualifiedForDayCredit && !existing?.qualified) {
    // Check if yesterday was qualified
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    if (data.dayRecords[yesterdayStr]?.qualified || newStreak > 0) {
      newStreak += 1;
    } else {
      newStreak = 1;
    }
  }

  // Week count
  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
  let weekCount = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    const ds = d.toISOString().split('T')[0];
    if (ds === todayStr) {
      if (dayRecord.qualified) weekCount++;
    } else if (data.dayRecords[ds]?.qualified) weekCount++;
  }

  updateData(d => ({
    ...d,
    sessions: [...d.sessions, session],
    dayRecords: { ...d.dayRecords, [todayStr]: dayRecord },
    streak: {
      ...d.streak,
      currentDailyStreak: newStreak,
      longestDailyStreak: Math.max(d.streak.longestDailyStreak, newStreak),
      currentWeekCount: weekCount,
    },
  }));

  return session;
}

export function resetData() {
  localStorage.removeItem(STORAGE_KEY);
  _data = null;
}
