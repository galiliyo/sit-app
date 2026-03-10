import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { getData, updateData, resetData } from '@/lib/store';
import { Preset } from '@/lib/types';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import PresetEditor from '@/components/PresetEditor';
import { Section, Row, Chip, ToggleRow } from '@/components/shared';

const SettingsScreen = () => {
  const data = getData();
  const [settings, setSettings] = useState({
    ...data.settings,
    warmUpEnabled: data.settings.warmUpEnabled ?? false,
    warmUpSeconds: data.settings.warmUpSeconds ?? 10,
  });
  const [presets, setPresets] = useState<Preset[]>(data.presets || []);
  const [reminders, setReminders] = useState(data.reminders);
  const [commitment, setCommitment] = useState(data.morningCommitmentTime || '07:30');
  const [editingPreset, setEditingPreset] = useState<Preset | null>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    updateData(d => ({ ...d, settings, presets, reminders, morningCommitmentTime: commitment }));
  }, [settings, presets, reminders, commitment]);

  const handleReset = () => {
    if (confirm('Reset all data? This cannot be undone.')) {
      resetData();
      window.location.reload();
    }
  };

  const handleSavePreset = (preset: Preset) => {
    let updated = [...presets];
    const idx = updated.findIndex(p => p.id === preset.id);
    if (idx >= 0) {
      updated[idx] = preset;
    } else {
      updated.push(preset);
    }
    if (preset.quickStart) {
      const qsPresets = updated.filter(p => p.quickStart);
      if (qsPresets.length > 3) {
        const toDisable = qsPresets.find(p => p.id !== preset.id);
        if (toDisable) {
          const di = updated.findIndex(p => p.id === toDisable.id);
          updated[di] = { ...updated[di], quickStart: false };
        }
      }
    }
    setPresets(updated);
    setEditingPreset(null);
    toast.success('Preset saved');
  };

  const handleDeletePreset = (id: string) => {
    setPresets(presets.filter(p => p.id !== id));
  };

  const handleNewPreset = () => {
    setEditingPreset({
      id: `p_${Date.now()}`,
      name: '',
      duration: 10,
      startBell: 'Root Chakra',
      endBell: 'Root Chakra',
      intervalBells: false,
      intervalMinutes: 7,
      ambientSound: null,
      quickStart: true,
    });
  };

  if (editingPreset) {
    return (
      <div className="flex min-h-screen flex-col px-6 pb-32 pt-14">
        <PresetEditor
          preset={editingPreset}
          onSave={handleSavePreset}
          onCancel={() => setEditingPreset(null)}
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col px-6 pb-24 pt-14">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-5">
        <h1 className="text-xl font-semibold text-foreground">Settings</h1>

        {/* Presets */}
        <Section title="Presets">
          <p className="mb-2 text-xs text-muted-foreground">
            Up to 3 can appear on your home screen as quick-start buttons
          </p>
          {presets.map(preset => (
            <div key={preset.id} className="flex items-center justify-between rounded-2xl bg-card px-5 py-4">
              <div className="flex items-center gap-3">
                {preset.quickStart && <div className="h-2 w-2 rounded-full bg-accent" />}
                <div>
                  <p className="text-sm text-foreground">{preset.name || `${preset.duration} min`}</p>
                  <p className="text-xs text-muted-foreground">
                    {preset.duration}m · {preset.startBell}{preset.intervalBells ? ' · intervals' : ''}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setEditingPreset(preset)} className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground transition-colors">
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => handleDeletePreset(preset.id)} className="rounded-lg p-1.5 text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
          <button onClick={handleNewPreset} className="flex items-center justify-center gap-2 rounded-2xl bg-card px-5 py-4 text-sm text-muted-foreground transition-colors active:bg-muted">
            <Plus className="h-4 w-4" />
            Add preset
          </button>
        </Section>

        {/* Goals */}
        <Section title="Goals">
          <Row>
            <span className="text-sm text-foreground">Weekly goal</span>
            <div className="flex items-center gap-2">
              {[3, 5, 7].map(n => (
                <Chip key={n} active={settings.weeklyGoal === n} onClick={() => setSettings(s => ({ ...s, weeklyGoal: n }))}>
                  {n}/wk
                </Chip>
              ))}
            </div>
          </Row>
          <Row>
            <span className="text-sm text-foreground">Minimum sit</span>
            <span className="text-sm text-muted-foreground">{settings.minimumSitMinutes} min</span>
          </Row>
        </Section>

        {/* Warm-up */}
        <Section title="Warm-up countdown">
          <Row>
            <div className="flex items-center gap-3">
              <Checkbox checked={settings.warmUpEnabled} onCheckedChange={(checked) => setSettings(s => ({ ...s, warmUpEnabled: !!checked }))} />
              <span className="text-sm text-foreground">Enable warm-up</span>
            </div>
          </Row>
          {settings.warmUpEnabled && (
            <Row>
              <span className="text-sm text-foreground">Duration</span>
              <div className="flex items-center gap-2">
                {[5, 10, 15, 30].map(n => (
                  <Chip key={n} active={settings.warmUpSeconds === n} onClick={() => setSettings(s => ({ ...s, warmUpSeconds: n }))}>
                    {n}s
                  </Chip>
                ))}
              </div>
            </Row>
          )}
        </Section>

        {/* Reminders */}
        <Section title="Reminders">
          <ToggleRow label="Morning reminder" value={reminders.morningEnabled} onChange={v => setReminders(r => ({ ...r, morningEnabled: v }))} />
          {reminders.morningEnabled && (
            <Row>
              <span className="text-sm text-foreground">Time</span>
              <input type="time" value={reminders.morningTime} onChange={e => setReminders(r => ({ ...r, morningTime: e.target.value }))} className="bg-transparent text-right text-sm text-accent outline-none" />
            </Row>
          )}
          <ToggleRow label="Evening reminder" value={reminders.eveningEnabled} onChange={v => setReminders(r => ({ ...r, eveningEnabled: v }))} />
          {reminders.eveningEnabled && (
            <Row>
              <span className="text-sm text-foreground">Time</span>
              <input type="time" value={reminders.eveningTime} onChange={e => setReminders(r => ({ ...r, eveningTime: e.target.value }))} className="bg-transparent text-right text-sm text-accent outline-none" />
            </Row>
          )}
        </Section>

        {/* Morning commitment */}
        <Section title="Morning commitment">
          <Row>
            <span className="text-sm text-foreground">Tomorrow at</span>
            <input type="time" value={commitment} onChange={e => setCommitment(e.target.value)} className="bg-transparent text-right text-sm text-accent outline-none" />
          </Row>
        </Section>

        {/* Data */}
        <Section title="Data">
          <button onClick={handleReset} className="w-full rounded-2xl bg-card px-5 py-4 text-left text-sm text-destructive">
            Reset all data
          </button>
        </Section>

        <p className="pb-4 text-center text-xs text-muted-foreground">Sit · v0.1</p>
      </motion.div>
    </div>
  );
};

export default SettingsScreen;
