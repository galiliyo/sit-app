import { motion } from 'framer-motion';
import { Flame, Clock } from 'lucide-react';
import { getData, getTodayStr } from '@/lib/store';
import EnsoButton from '@/components/EnsoButton';
import { format, parseISO } from 'date-fns';
import { TimerConfig, Preset } from '@/lib/types';

interface HomeScreenProps {
  onStartWithConfig: (config: TimerConfig) => void;
  onOpenTimerSetup: () => void;
}

function presetToConfig(preset: Preset): TimerConfig {
  return {
    duration: preset.duration,
    startBell: preset.startBell,
    endBell: preset.endBell,
    intervalBells: preset.intervalBells,
    intervalMinutes: preset.intervalMinutes,
    ambientSound: preset.ambientSound,
  };
}

const HomeScreen = ({ onStartWithConfig, onOpenTimerSetup }: HomeScreenProps) => {
  const data = getData();
  const todayStr = getTodayStr();
  const todayRecord = data.dayRecords[todayStr];
  const hasSatToday = !!todayRecord?.qualified;
  const todayMinutes = todayRecord?.totalMinutes || 0;
  const streak = data.streak.currentDailyStreak;
  const weekCount = data.streak.currentWeekCount;
  const weeklyGoal = data.streak.weeklyGoal;

  const quickPresets = (data.presets || []).filter(p => p.quickStart).slice(0, 3);
  const defaultPreset = quickPresets[0];

  const lastSession = data.sessions.length > 0 ? data.sessions[data.sessions.length - 1] : null;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="flex min-h-screen flex-col px-6 pb-24 pt-14">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col gap-8"
      >
        {/* Greeting */}
        <div>
          <p className="text-sm text-muted-foreground">{greeting}</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
            {hasSatToday ? 'You sat today' : 'Today is still open'}
          </h1>
        </div>

        {/* Last session */}
        {lastSession && (
          <div className="rounded-2xl bg-card px-5 py-4">
            <p className="text-xs text-muted-foreground mb-1">Last session</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${lastSession.qualifiedForDayCredit ? 'bg-success' : 'bg-destructive'}`} />
                <span className="text-sm text-foreground">
                  {lastSession.durationMinutes} min · {lastSession.sessionType}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                {format(parseISO(lastSession.startTime), 'MMM d, h:mm a')}
              </span>
            </div>
            {!lastSession.qualifiedForDayCredit && (
              <p className="mt-1 text-xs text-destructive">
                Below {data.settings.minimumSitMinutes}-min minimum — didn't count
              </p>
            )}
          </div>
        )}

        {/* Sit Now CTA */}
        <div className="flex flex-col items-center gap-5">
          <button
            onClick={() => defaultPreset && onStartWithConfig(presetToConfig(defaultPreset))}
            className="flex h-32 w-32 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_0_40px_hsl(var(--primary)/0.15)] transition-transform active:scale-95"
          >
            <span className="text-lg font-semibold">Sit now</span>
          </button>
          <p className="text-xs text-muted-foreground">Just {data.settings.minimumSitMinutes} minutes counts</p>
        </div>

        {/* Quick presets */}
        <div className="flex justify-center gap-3">
          {quickPresets.map(preset => (
            <button
              key={preset.id}
              onClick={() => onStartWithConfig(presetToConfig(preset))}
              className="rounded-xl bg-secondary px-5 py-2.5 text-sm font-medium text-secondary-foreground transition-colors active:bg-muted"
            >
              {preset.name && !preset.name.match(/^\d+\s*min$/i) ? `${preset.name} · ${preset.duration}m` : `${preset.duration} min`}
            </button>
          ))}
          <button
            onClick={onOpenTimerSetup}
            className="rounded-xl bg-secondary px-4 py-2.5 text-sm font-medium text-secondary-foreground transition-colors active:bg-muted"
          >
            Custom
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl bg-card p-4 text-center">
            <div className="flex items-center justify-center gap-1">
              <Flame className="h-4 w-4 text-accent" />
              <span className="stat-number text-2xl text-foreground">{streak}</span>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">day streak</p>
          </div>
          <div className="rounded-2xl bg-card p-4 text-center">
            <span className="stat-number text-2xl text-foreground">{todayMinutes}</span>
            <p className="mt-1 text-[11px] text-muted-foreground">mins today</p>
          </div>
          <div className="rounded-2xl bg-card p-4 text-center">
            <span className="stat-number text-2xl text-foreground">{weekCount}<span className="text-muted-foreground text-base">/{weeklyGoal}</span></span>
            <p className="mt-1 text-[11px] text-muted-foreground">this week</p>
          </div>
        </div>

        {/* Morning commitment */}
        {data.morningCommitmentTime && (
          <button
            onClick={onOpenTimerSetup}
            className="flex items-center justify-between rounded-2xl bg-card px-5 py-4 transition-colors active:bg-muted"
          >
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div className="text-left">
                <p className="text-sm text-foreground">Tomorrow morning</p>
                <p className="text-xs text-muted-foreground">{data.morningCommitmentTime} AM · {defaultPreset?.duration || 5} min</p>
              </div>
            </div>
          </button>
        )}

        {/* Today status */}
        {hasSatToday && (
          <div className="rounded-2xl bg-card px-5 py-4">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-success" />
              <p className="text-sm text-foreground">
                {todayRecord?.totalSessions} session{(todayRecord?.totalSessions || 0) > 1 ? 's' : ''} · {todayMinutes} minutes
              </p>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Streak preserved</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default HomeScreen;
