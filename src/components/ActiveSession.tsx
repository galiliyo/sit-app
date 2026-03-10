import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause } from 'lucide-react';
import { TimerConfig } from '@/lib/types';

interface ActiveSessionProps {
  config: TimerConfig;
  onFinish: (elapsedSeconds: number) => void;
  onDiscard: () => void;
}

const ActiveSession = ({ config, onFinish, onDiscard }: ActiveSessionProps) => {
  const totalSeconds = config.duration * 60;
  const [remaining, setRemaining] = useState(totalSeconds);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
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
  }, [paused, remaining]);

  useEffect(() => {
    if (remaining === 0) {
      // Auto finish after a brief delay
      const t = setTimeout(() => onFinish(totalSeconds), 1500);
      return () => clearTimeout(t);
    }
  }, [remaining, totalSeconds, onFinish]);

  const elapsed = totalSeconds - remaining;
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;

  const bellsRemaining = config.intervalBells
    ? Math.floor(remaining / (config.intervalMinutes * 60))
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex min-h-screen flex-col items-center justify-between px-6 py-14"
    >
      {/* Top label */}
      <p className="text-sm text-muted-foreground">Meditation</p>

      {/* Timer */}
      <div className="flex flex-col items-center gap-3">
        {/* Breathing pulse behind */}
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

      {/* Controls */}
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
