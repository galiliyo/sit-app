import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Flame } from 'lucide-react';
import { getData } from '@/lib/store';

const CalendarScreen = () => {
  const data = getData();
  const [viewDate, setViewDate] = useState(new Date());

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthName = viewDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const offset = (firstDay + 6) % 7; // Monday start

  const days = Array.from({ length: 42 }, (_, i) => {
    const dayNum = i - offset + 1;
    if (dayNum < 1 || dayNum > daysInMonth) return null;
    return dayNum;
  });

  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const selectedRecord = selectedDay ? data.dayRecords[selectedDay] : null;

  function dayStr(day: number) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  const prev = () => setViewDate(new Date(year, month - 1, 1));
  const next = () => setViewDate(new Date(year, month + 1, 1));

  return (
    <div className="flex min-h-screen flex-col px-6 pb-24 pt-14">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-foreground">Calendar</h1>
          <div className="flex items-center gap-1">
            <Flame className="h-4 w-4 text-accent" />
            <span className="stat-number text-sm text-foreground">{data.streak.currentDailyStreak}</span>
          </div>
        </div>

        {/* Month nav */}
        <div className="flex items-center justify-between">
          <button onClick={prev} className="p-2 text-muted-foreground"><ChevronLeft className="h-5 w-5" /></button>
          <span className="text-sm font-medium text-foreground">{monthName}</span>
          <button onClick={next} className="p-2 text-muted-foreground"><ChevronRight className="h-5 w-5" /></button>
        </div>

        {/* Week headers */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(d => (
            <span key={d} className="text-[11px] text-muted-foreground">{d}</span>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, i) => {
            if (!day) return <div key={i} />;
            const ds = dayStr(day);
            const record = data.dayRecords[ds];
            const isToday = ds === todayStr;
            const qualified = record?.qualified;
            const isSelected = ds === selectedDay;

            return (
              <button
                key={i}
                onClick={() => setSelectedDay(ds === selectedDay ? null : ds)}
                className={`relative flex h-10 w-full items-center justify-center rounded-xl text-sm transition-colors ${
                  isSelected
                    ? 'bg-accent text-accent-foreground'
                    : qualified
                    ? 'bg-success/15 text-success'
                    : isToday
                    ? 'ring-1 ring-accent/30 text-foreground'
                    : 'text-muted-foreground'
                }`}
              >
                {day}
                {qualified && !isSelected && (
                  <span className="absolute bottom-1 h-1 w-1 rounded-full bg-success" />
                )}
              </button>
            );
          })}
        </div>

        {/* Selected day detail */}
        {selectedDay && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-card px-5 py-4"
          >
            <p className="text-sm font-medium text-foreground">
              {new Date(selectedDay + 'T12:00:00').toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
            {selectedRecord ? (
              <div className="mt-2 space-y-1">
                <p className="text-sm text-muted-foreground">{selectedRecord.totalSessions} session{selectedRecord.totalSessions > 1 ? 's' : ''} · {selectedRecord.totalMinutes} minutes</p>
                <p className="text-xs text-muted-foreground">{selectedRecord.qualified ? '✓ Counted toward streak' : 'Below minimum threshold'}</p>
              </div>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">No sessions</p>
            )}
          </motion.div>
        )}

        {/* Streak cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-card p-4 text-center">
            <span className="stat-number text-2xl text-foreground">{data.streak.currentDailyStreak}</span>
            <p className="mt-1 text-[11px] text-muted-foreground">current streak</p>
          </div>
          <div className="rounded-2xl bg-card p-4 text-center">
            <span className="stat-number text-2xl text-foreground">{data.streak.longestDailyStreak}</span>
            <p className="mt-1 text-[11px] text-muted-foreground">longest streak</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CalendarScreen;
