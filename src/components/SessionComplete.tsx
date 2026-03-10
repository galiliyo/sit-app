import { motion } from 'framer-motion';
import { Flame, Check } from 'lucide-react';
import { getData } from '@/lib/store';

interface SessionCompleteProps {
  durationMinutes: number;
  qualified: boolean;
  onContinue: () => void;
}

const SessionComplete = ({ durationMinutes, qualified, onContinue }: SessionCompleteProps) => {
  const data = getData();
  const streak = data.streak.currentDailyStreak;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="relative flex min-h-screen flex-col items-center justify-center gap-8 px-6 overflow-hidden"
    >
      {/* Radial glow behind icon — only when qualified */}
      {qualified && (
        <>
          {/* Outer soft pulse */}
          <motion.div
            initial={{ opacity: 0, scale: 0.3 }}
            animate={{ opacity: [0, 0.35, 0.15], scale: [0.3, 1.4, 1.6] }}
            transition={{ duration: 3, ease: 'easeOut' }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-72 w-72 rounded-full"
            style={{
              background: 'radial-gradient(circle, hsl(var(--accent) / 0.25) 0%, hsl(var(--accent) / 0.08) 50%, transparent 70%)',
            }}
          />
          {/* Inner warm glow */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: [0, 0.5, 0.25], scale: [0.5, 1.1, 1.2] }}
            transition={{ duration: 2.5, ease: 'easeOut', delay: 0.15 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-40 w-40 rounded-full"
            style={{
              background: 'radial-gradient(circle, hsl(var(--success) / 0.3) 0%, hsl(var(--success) / 0.05) 60%, transparent 80%)',
            }}
          />
          {/* Floating petal particles */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 0, x: 0, scale: 0 }}
              animate={{
                opacity: [0, 0.6, 0],
                y: [0, -60 - i * 15],
                x: [0, (i % 2 === 0 ? 1 : -1) * (20 + i * 8)],
                scale: [0, 1, 0.5],
              }}
              transition={{
                duration: 2.5 + i * 0.3,
                delay: 0.5 + i * 0.15,
                ease: 'easeOut',
              }}
              className="absolute top-1/2 left-1/2 h-2 w-2 rounded-full bg-accent/40"
            />
          ))}
        </>
      )}

      {/* Lotus / check */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className="relative z-10 flex h-24 w-24 items-center justify-center rounded-full bg-success/10"
      >
        {qualified && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.6, 0.2, 0.4, 0.15] }}
            transition={{ duration: 4, ease: 'easeInOut', repeat: Infinity, repeatType: 'reverse' }}
            className="absolute inset-0 rounded-full"
            style={{
              boxShadow: '0 0 30px 8px hsl(var(--success) / 0.25), 0 0 60px 16px hsl(var(--accent) / 0.1)',
            }}
          />
        )}
        <Check className="h-10 w-10 text-success" />
      </motion.div>

      <div className="relative z-10 text-center">
        <h2 className="text-3xl font-semibold text-foreground">{durationMinutes} minutes</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {qualified ? 'Day complete' : 'Session recorded'}
        </p>
      </div>

      {/* Streak */}
      {qualified && streak > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="relative z-10 flex items-center gap-2 rounded-2xl bg-card px-6 py-4"
        >
          <Flame className="h-5 w-5 text-accent" />
          <span className="stat-number text-xl text-foreground">{streak}</span>
          <span className="text-sm text-muted-foreground">day streak</span>
        </motion.div>
      )}

      {/* Week progress */}
      <div className="relative z-10 flex items-center gap-1.5">
        {Array.from({ length: data.streak.weeklyGoal }).map((_, i) => (
          <motion.div
            key={i}
            initial={qualified && i === data.streak.currentWeekCount - 1 ? { scale: 0 } : {}}
            animate={qualified && i === data.streak.currentWeekCount - 1 ? { scale: [0, 1.4, 1] } : {}}
            transition={{ delay: 0.8, duration: 0.5, type: 'spring' }}
            className={`h-2.5 w-2.5 rounded-full ${
              i < data.streak.currentWeekCount ? 'bg-accent' : 'bg-muted'
            }`}
          />
        ))}
        <span className="ml-2 text-xs text-muted-foreground">
          {data.streak.currentWeekCount} of {data.streak.weeklyGoal} this week
        </span>
      </div>

      {/* Motivational */}
      <p className="relative z-10 text-sm text-muted-foreground">Back tomorrow morning</p>

      {/* CTA */}
      <button
        onClick={onContinue}
        className="relative z-10 w-full max-w-xs rounded-2xl bg-primary py-4 text-center font-semibold text-primary-foreground transition-transform active:scale-[0.98]"
      >
        Continue
      </button>
    </motion.div>
  );
};

export default SessionComplete;
