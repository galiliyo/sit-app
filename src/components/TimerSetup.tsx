import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ChevronRight, Volume2 } from 'lucide-react';
import { getData } from '@/lib/store';
import { TimerConfig } from '@/lib/types';
import { BELL_OPTIONS, previewBell } from '@/lib/bells';

interface TimerSetupProps {
  onStart: (config: TimerConfig) => void;
  onBack: () => void;
  initialDuration?: number;
}

const durations = [2, 5, 7, 10, 15, 20, 30, 45, 60];
const bellOptions = [...BELL_OPTIONS];

const TimerSetup = ({ onStart, onBack, initialDuration }: TimerSetupProps) => {
  const data = getData();
  const [duration, setDuration] = useState(initialDuration || data.settings.defaultQuickStartMinutes);
  const [startBell, setStartBell] = useState(migrateBellName(data.settings.preferredStartBell));
  const [endBell, setEndBell] = useState(migrateBellName(data.settings.preferredEndBell));
  const [intervalBells, setIntervalBells] = useState(data.settings.intervalBellsEnabled);
  const [ambientSound] = useState<string | null>(null);

  const config: TimerConfig = {
    duration,
    startBell,
    endBell,
    intervalBells,
    intervalMinutes: 7,
    ambientSound,
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      className="flex min-h-screen flex-col px-6 pb-24 pt-6"
    >
      <button onClick={onBack} className="mb-6 flex items-center gap-1 text-sm text-muted-foreground">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <h2 className="mb-8 text-xl font-semibold text-foreground">Set up your sit</h2>

      {/* Duration */}
      <div className="mb-6">
        <p className="mb-3 text-sm text-muted-foreground">Duration</p>
        <div className="flex flex-wrap gap-2">
          {durations.map(d => (
            <button
              key={d}
              onClick={() => setDuration(d)}
              className={`rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                d === duration
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-secondary text-secondary-foreground active:bg-muted'
              }`}
            >
              {d} min
            </button>
          ))}
        </div>
      </div>

      {/* Settings rows */}
      <div className="flex flex-col gap-1">
        <BellRow label="Starting bell" value={startBell} options={bellOptions} onChange={setStartBell} />
        <BellRow label="Ending bell" value={endBell} options={bellOptions} onChange={setEndBell} />
        <div className="flex items-center justify-between rounded-2xl bg-card px-5 py-4">
          <span className="text-sm text-foreground">Interval bells</span>
          <button
            onClick={() => setIntervalBells(!intervalBells)}
            className={`h-7 w-12 rounded-full p-0.5 transition-colors ${intervalBells ? 'bg-accent' : 'bg-muted'}`}
          >
            <div className={`h-6 w-6 rounded-full bg-foreground transition-transform ${intervalBells ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>
        <div className="flex items-center justify-between rounded-2xl bg-card px-5 py-4">
          <span className="text-sm text-foreground">Ambient sound</span>
          <span className="text-sm text-muted-foreground">None</span>
        </div>
      </div>

      {/* Start button */}
      <div className="mt-auto pt-8">
        <button
          onClick={() => onStart(config)}
          className="w-full rounded-2xl bg-primary py-4 text-center text-lg font-semibold text-primary-foreground transition-transform active:scale-[0.98]"
        >
          Start
        </button>
      </div>
    </motion.div>
  );
};

function BellRow({ label, value, options, onChange }: {
  label: string; value: string; options: string[]; onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between rounded-2xl bg-card px-5 py-4"
      >
        <span className="text-sm text-foreground">{label}</span>
        <div className="flex items-center gap-2">
          {value !== 'None' && (
            <button
              onClick={(e) => { e.stopPropagation(); previewBell(value); }}
              className="rounded-lg p-1 text-muted-foreground hover:text-accent transition-colors"
              aria-label="Preview bell"
            >
              <Volume2 className="h-4 w-4" />
            </button>
          )}
          <span className="text-sm text-accent">{value}</span>
          <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${open ? 'rotate-90' : ''}`} />
        </div>
      </button>
      {open && (
        <div className="mt-1 flex flex-wrap gap-2 px-2 py-2">
          {options.map(o => (
            <button
              key={o}
              onClick={() => { onChange(o); setOpen(false); }}
              className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                o === value ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'
              }`}
            >
              {o}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function migrateBellName(name: string): string {
  if (name === 'Kangsê' || name === 'Om' || name === 'HanChi') return 'Root Chakra';
  if (name === 'Tingsha') return 'Heart Chakra';
  if (BELL_OPTIONS.includes(name as any)) return name;
  return 'Root Chakra';
}

export default TimerSetup;
