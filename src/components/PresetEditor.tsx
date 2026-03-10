import { useState } from 'react';
import { ArrowLeft, Volume2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Preset } from '@/lib/types';
import { BELL_OPTIONS, previewBell } from '@/lib/bells';
import { Checkbox } from '@/components/ui/checkbox';

const durations = [2, 5, 7, 10, 15, 20, 30, 45, 60];

interface PresetEditorProps {
  preset: Preset;
  onSave: (preset: Preset) => void;
  onCancel: () => void;
  canEnableQuickStart: boolean;
}

const PresetEditor = ({ preset, onSave, onCancel, canEnableQuickStart }: PresetEditorProps) => {
  const [draft, setDraft] = useState<Preset>({ ...preset });

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex flex-col gap-5"
    >
      <button onClick={onCancel} className="flex items-center gap-1 text-sm text-muted-foreground">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <h2 className="text-lg font-semibold text-foreground">
        {preset.id ? 'Edit preset' : 'New preset'}
      </h2>

      {/* Name */}
      <div>
        <p className="mb-2 text-xs text-muted-foreground">Name</p>
        <input
          type="text"
          value={draft.name}
          onChange={e => setDraft(d => ({ ...d, name: e.target.value }))}
          className="w-full rounded-2xl bg-card px-5 py-4 text-sm text-foreground outline-none"
          placeholder="e.g. Morning sit"
          maxLength={20}
        />
      </div>

      {/* Duration */}
      <div>
        <p className="mb-2 text-xs text-muted-foreground">Duration</p>
        <div className="flex flex-wrap gap-2">
          {durations.map(d => (
            <button
              key={d}
              onClick={() => setDraft(p => ({ ...p, duration: d }))}
              className={`rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                d === draft.duration
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-secondary text-secondary-foreground active:bg-muted'
              }`}
            >
              {d} min
            </button>
          ))}
        </div>
      </div>

      {/* Bells */}
      <div className="flex flex-col gap-1">
        <BellSelect label="Starting bell" value={draft.startBell} onChange={v => setDraft(d => ({ ...d, startBell: v }))} />
        <BellSelect label="Ending bell" value={draft.endBell} onChange={v => setDraft(d => ({ ...d, endBell: v }))} />
      </div>

      {/* Interval bells */}
      <div className="flex items-center justify-between rounded-2xl bg-card px-5 py-4">
        <span className="text-sm text-foreground">Interval bells</span>
        <button
          onClick={() => setDraft(d => ({ ...d, intervalBells: !d.intervalBells }))}
          className={`h-7 w-12 rounded-full p-0.5 transition-colors ${draft.intervalBells ? 'bg-accent' : 'bg-muted'}`}
        >
          <div className={`h-6 w-6 rounded-full bg-foreground transition-transform ${draft.intervalBells ? 'translate-x-5' : 'translate-x-0'}`} />
        </button>
      </div>

      {/* Quick start toggle */}
      <div className="flex items-center gap-3 rounded-2xl bg-card px-5 py-4">
        <Checkbox
          checked={draft.quickStart}
          onCheckedChange={(checked) => setDraft(d => ({ ...d, quickStart: !!checked }))}
          disabled={!draft.quickStart && !canEnableQuickStart}
        />
        <div>
          <span className="text-sm text-foreground">Show in quick start</span>
          {!draft.quickStart && !canEnableQuickStart && (
            <p className="text-xs text-muted-foreground">Max 3 quick-start presets</p>
          )}
        </div>
      </div>

      {/* Save - with enough space to clear bottom nav */}
      <div className="pb-8">
        <button
          onClick={() => onSave(draft)}
          className="relative z-[60] w-full rounded-2xl bg-accent py-3.5 text-center font-semibold text-accent-foreground transition-transform active:scale-[0.98]"
        >
          Save preset
        </button>
      </div>
    </motion.div>
  );
};

function BellSelect({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
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
            >
              <Volume2 className="h-4 w-4" />
            </button>
          )}
          <span className="text-sm text-accent">{value}</span>
        </div>
      </button>
      {open && (
        <div className="mt-1 flex flex-wrap gap-2 px-2 py-2">
          {BELL_OPTIONS.map(o => (
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

export default PresetEditor;
