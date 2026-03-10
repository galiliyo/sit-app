import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Flame, ChevronRight, Clock } from 'lucide-react';
import { getData, getTodayStr } from '@/lib/store';

interface HomeScreenProps {
  onStartTimer: (duration: number) => void;
  onOpenTimerSetup: () => void;
}

const HomeScreen = ({ onStartTimer, onOpenTimerSetup }: HomeScreenProps) => {
  const data = getData();
  const todayStr = getTodayStr();
  const todayRecord = data.dayRecords[todayStr];
  const hasSatToday = !!todayRecord?.qualified;
  const todayMinutes = todayRecord?.totalMinutes || 0;
  const streak = data.streak.currentDailyStreak;
  const weekCount = data.streak.currentWeekCount;
  const weeklyGoal = data.streak.weeklyGoal;

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

        {/* Sit Now CTA */}
        <div className="flex flex-col items-center gap-5">
          <button
            onClick={() => onStartTimer(data.settings.defaultQuickStartMinutes)}
            className="flex h-32 w-32 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_0_40px_hsl(var(--primary)/0.15)] transition-transform active:scale-95"
          >
            <span className="text-lg font-semibold">Sit now</span>
          </button>
          <p className="text-xs text-muted-foreground">Just 2 minutes counts</p>
        </div>

        {/* Quick durations */}
        <div className="flex justify-center gap-3">
          {[5, 10, 15].map(min => (
            <button
              key={min}
              onClick={() => onStartTimer(min)}
              className="rounded-xl bg-secondary px-5 py-2.5 text-sm font-medium text-secondary-foreground transition-colors active:bg-muted"
            >
              {min} min
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
                <p className="text-xs text-muted-foreground">{data.morningCommitmentTime} AM · {data.settings.defaultQuickStartMinutes} min</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
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
