import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause } from 'lucide-react';
import { TimerConfig } from '@/lib/types';
import { getData } from '@/lib/store';
import { playBell } from '@/lib/bells';

interface ActiveSessionProps {
  config: TimerConfig;
  onFinish: (elapsedSeconds: number) => void;
  onDiscard: () => void;
}

const ActiveSession = ({ config, onFinish, onDiscard }: ActiveSessionProps) => {
  const data = getData();
  const warmUpEnabled = data.settings.warmUpEnabled ?? false;
  const warmUpDuration = data.settings.warmUpSeconds ?? 10;

  const [phase, setPhase] = useState<'warmup' | 'session'>(warmUpEnabled ? 'warmup' : 'session');
  const [warmUpRemaining, setWarmUpRemaining] = useState(warmUpDuration);

  const totalSeconds = config.duration * 60;
  const [remaining, setRemaining] = useState(totalSeconds);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startBellPlayed = useRef(false);
  const endBellPlayed = useRef(false);
  const lastIntervalBell = useRef(0);

  // Play start bell when session phase begins
  useEffect(() => {
    if (phase === 'session' && !startBellPlayed.current) {
      startBellPlayed.current = true;
      playBell(config.startBell);
    }
  }, [phase, config.startBell]);

  // Warm-up countdown
  useEffect(() => {
    if (phase !== 'warmup') return;
    const id = setInterval(() => {
      setWarmUpRemaining(prev => {
        if (prev <= 1) {
          clearInterval(id);
          setPhase('session');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [phase]);

  // Session countdown
  useEffect(() => {
    if (phase !== 'session') return;
    if (!paused && remaining > 0) {
      intervalRef.current = setInterval(() => {
        setRemaining(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [paused, remaining, phase]);

  // Interval bells
  useEffect(() => {
    if (phase !== 'session' || !config.intervalBells || paused || remaining <= 0) return;
    const elapsed = totalSeconds - remaining;
    const intervalSecs = config.intervalMinutes * 60;
    const currentInterval = Math.floor(elapsed / intervalSecs);
    if (currentInterval > 0 && currentInterval !== lastIntervalBell.current) {
      lastIntervalBell.current = currentInterval;
      playBell(config.startBell);
    }
  }, [remaining, phase, paused, config, totalSeconds]);

  // End bell + finish
  useEffect(() => {
    if (phase === 'session' && remaining === 0 && !endBellPlayed.current) {
      endBellPlayed.current = true;
      playBell(config.endBell);
      const t = setTimeout(() => onFinish(totalSeconds), 2500);
      return () => clearTimeout(t);
    }
  }, [remaining, totalSeconds, onFinish, phase, config.endBell]);

  const elapsed = totalSeconds - remaining;
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;

  const bellsRemaining = config.intervalBells
    ? Math.floor(remaining / (config.intervalMinutes * 60))
    : 0;

  // Warm-up phase UI
  if (phase === 'warmup') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex min-h-screen flex-col items-center justify-center px-6"
      >
        <p className="text-sm text-muted-foreground mb-4">Prepare yourself</p>
        <span className="timer-text text-8xl text-accent">{warmUpRemaining}</span>
        <p className="mt-6 text-sm text-muted-foreground">Session begins shortly</p>
        <button
          onClick={() => setPhase('session')}
          className="mt-8 text-sm text-muted-foreground underline"
        >
          Skip warm-up
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex min-h-screen flex-col items-center justify-between px-6 py-14"
    >
      <p className="text-sm text-muted-foreground">Meditation</p>

      <div className="flex flex-col items-center gap-3">
        <div className="breathing-pulse absolute h-48 w-48 rounded-full bg-accent/5" />
        <span className="timer-text relative z-10 text-7xl text-foreground">
          {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
        </span>
        {config.intervalBells && remaining > 0 && (
          <p className="text-sm text-muted-foreground">{bellsRemaining} bell{bellsRemaining !== 1 ? 's' : ''} remaining</p>
        )}
        {remaining === 0 && (
          <p className="text-sm text-accent">Session complete</p>
        )}
      </div>

      <div className="flex w-full flex-col items-center gap-4">
        {remaining > 0 && (
          <button
            onClick={() => setPaused(!paused)}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground"
          >
            {paused ? <Play className="ml-0.5 h-6 w-6" /> : <Pause className="h-6 w-6" />}
          </button>
        )}

        <button
          onClick={() => onFinish(elapsed)}
          className="w-full rounded-2xl bg-primary py-4 text-center font-semibold text-primary-foreground"
        >
          Finish
        </button>
        <button
          onClick={onDiscard}
          className="text-sm text-muted-foreground"
        >
          Discard session
        </button>
      </div>
    </motion.div>
  );
};

export default ActiveSession;
