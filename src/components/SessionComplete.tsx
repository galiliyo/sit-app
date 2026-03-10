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
      className="flex min-h-screen flex-col items-center justify-center gap-8 px-6"
    >
      {/* Lotus / check */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className="flex h-24 w-24 items-center justify-center rounded-full bg-success/10"
      >
        <Check className="h-10 w-10 text-success" />
      </motion.div>

      <div className="text-center">
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
          className="flex items-center gap-2 rounded-2xl bg-card px-6 py-4"
        >
          <Flame className="h-5 w-5 text-accent" />
          <span className="stat-number text-xl text-foreground">{streak}</span>
          <span className="text-sm text-muted-foreground">day streak</span>
        </motion.div>
      )}

      {/* Week progress */}
      <div className="flex items-center gap-1.5">
        {Array.from({ length: data.streak.weeklyGoal }).map((_, i) => (
          <div
            key={i}
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
      <p className="text-sm text-muted-foreground">Back tomorrow morning</p>

      {/* CTA */}
      <button
        onClick={onContinue}
        className="w-full max-w-xs rounded-2xl bg-primary py-4 text-center font-semibold text-primary-foreground transition-transform active:scale-[0.98]"
      >
        Continue
      </button>
    </motion.div>
  );
};

export default SessionComplete;
