import { motion } from 'framer-motion';
import { Flame, Clock, Sun, Moon, Target, Award } from 'lucide-react';
import { getData, getStats } from '@/lib/store';

const StatsScreen = () => {
  const data = getData();
  const stats = getStats();
  const milestones = data.milestones.filter(m => m.achieved);

  // Weekly bar chart - last 7 days
  const today = new Date();
  const weekData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    const ds = d.toISOString().split('T')[0];
    const record = data.dayRecords[ds];
    return {
      label: d.toLocaleDateString('default', { weekday: 'short' }).slice(0, 2),
      minutes: record?.totalMinutes || 0,
      qualified: record?.qualified || false,
    };
  });
  const maxMin = Math.max(...weekData.map(d => d.minutes), 1);

  return (
    <div className="flex min-h-screen flex-col px-6 pb-24 pt-14">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6">
        <h1 className="text-xl font-semibold text-foreground">Stats</h1>

        {/* Main stats grid */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard icon={<Clock className="h-4 w-4" />} value={stats.totalMinutes} label="total minutes" />
          <StatCard icon={<Target className="h-4 w-4" />} value={stats.totalSessions} label="total sessions" />
          <StatCard icon={<Flame className="h-4 w-4 text-accent" />} value={data.streak.currentDailyStreak} label="current streak" />
          <StatCard icon={<Award className="h-4 w-4" />} value={data.streak.longestDailyStreak} label="longest streak" />
          <StatCard icon={<Sun className="h-4 w-4" />} value={stats.morningSessions} label="morning sits" />
          <StatCard icon={<Moon className="h-4 w-4" />} value={stats.eveningSessions} label="evening sits" />
        </div>

        {/* Extra stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-card p-4 text-center">
            <span className="stat-number text-2xl text-foreground">{stats.totalDaysMeditated}</span>
            <p className="mt-1 text-[11px] text-muted-foreground">days meditated</p>
          </div>
          <div className="rounded-2xl bg-card p-4 text-center">
            <span className="stat-number text-2xl text-foreground">{stats.averageSessionMinutes}</span>
            <p className="mt-1 text-[11px] text-muted-foreground">avg. minutes</p>
          </div>
        </div>

        {/* Weekly chart */}
        <div className="rounded-2xl bg-card p-5">
          <p className="mb-4 text-sm text-muted-foreground">Last 7 days</p>
          <div className="flex items-end justify-between gap-2" style={{ height: 100 }}>
            {weekData.map((d, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                <div
                  className={`w-full rounded-md transition-all ${d.qualified ? 'bg-accent' : d.minutes > 0 ? 'bg-muted-foreground/30' : 'bg-muted'}`}
                  style={{ height: `${Math.max((d.minutes / maxMin) * 80, 4)}px` }}
                />
                <span className="text-[10px] text-muted-foreground">{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Identity line */}
        <p className="text-center text-sm text-muted-foreground">
          You are becoming someone who sits
        </p>

        {/* Milestones */}
        {milestones.length > 0 && (
          <div>
            <p className="mb-3 text-sm text-muted-foreground">Milestones</p>
            <div className="flex flex-col gap-2">
              {milestones.map(m => (
                <div key={m.id} className="flex items-center gap-3 rounded-2xl bg-card px-4 py-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10">
                    <Award className="h-4 w-4 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-foreground">{m.title}</p>
                    <p className="text-xs text-muted-foreground">{m.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className="rounded-2xl bg-card p-4">
      <div className="mb-1 text-muted-foreground">{icon}</div>
      <span className="stat-number text-2xl text-foreground">{value}</span>
      <p className="mt-0.5 text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}

export default StatsScreen;
