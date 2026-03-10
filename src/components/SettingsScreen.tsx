import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Save } from 'lucide-react';
import { getData, updateData, resetData } from '@/lib/store';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

const SettingsScreen = () => {
  const data = getData();
  const [settings, setSettings] = useState({
    ...data.settings,
    quickStartPresets: data.settings.quickStartPresets || [5, 10, 15],
    warmUpEnabled: data.settings.warmUpEnabled ?? false,
    warmUpSeconds: data.settings.warmUpSeconds ?? 10,
  });
  const [reminders, setReminders] = useState(data.reminders);
  const [commitment, setCommitment] = useState(data.morningCommitmentTime || '07:30');
  const [newPreset, setNewPreset] = useState('');

  const save = () => {
    updateData(d => ({ ...d, settings, reminders, morningCommitmentTime: commitment }));
    toast.success('Settings saved');
  };

  const handleReset = () => {
    if (confirm('Reset all data? This cannot be undone.')) {
      resetData();
      window.location.reload();
    }
  };

  const addPreset = () => {
    const val = parseInt(newPreset);
    if (val > 0 && !settings.quickStartPresets.includes(val)) {
      setSettings(s => ({
        ...s,
        quickStartPresets: [...s.quickStartPresets, val].sort((a, b) => a - b),
      }));
      setNewPreset('');
    }
  };

  const removePreset = (min: number) => {
    setSettings(s => ({
      ...s,
      quickStartPresets: s.quickStartPresets.filter((p: number) => p !== min),
    }));
  };

  return (
    <div className="flex min-h-screen flex-col px-6 pb-24 pt-14">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-5">
        <h1 className="text-xl font-semibold text-foreground">Settings</h1>

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

        {/* Quick-start presets */}
        <Section title="Quick-start presets">
          <Row>
            <div className="flex flex-wrap gap-2">
              {settings.quickStartPresets.map((min: number) => (
                <div key={min} className="flex items-center gap-1 rounded-lg bg-secondary px-3 py-1.5">
                  <span className="text-sm text-secondary-foreground">{min}m</span>
                  <button onClick={() => removePreset(min)} className="ml-1 text-muted-foreground hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  placeholder="min"
                  value={newPreset}
                  onChange={e => setNewPreset(e.target.value)}
                  className="w-14 rounded-lg bg-muted px-2 py-1.5 text-sm text-foreground outline-none"
                  min={1}
                  max={120}
                />
                <button onClick={addPreset} className="rounded-lg bg-accent p-1.5 text-accent-foreground">
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            </div>
          </Row>
        </Section>

        {/* Timer defaults */}
        <Section title="Timer defaults">
          <Row>
            <span className="text-sm text-foreground">Quick-start</span>
            <div className="flex items-center gap-2">
              {[5, 10, 15].map(n => (
                <Chip key={n} active={settings.defaultQuickStartMinutes === n} onClick={() => setSettings(s => ({ ...s, defaultQuickStartMinutes: n }))}>
                  {n}m
                </Chip>
              ))}
            </div>
          </Row>
        </Section>

        {/* Warm-up */}
        <Section title="Warm-up countdown">
          <Row>
            <div className="flex items-center gap-3">
              <Checkbox
                checked={settings.warmUpEnabled}
                onCheckedChange={(checked) => setSettings(s => ({ ...s, warmUpEnabled: !!checked }))}
              />
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
          <ToggleRow
            label="Morning reminder"
            value={reminders.morningEnabled}
            onChange={v => setReminders(r => ({ ...r, morningEnabled: v }))}
          />
          {reminders.morningEnabled && (
            <Row>
              <span className="text-sm text-foreground">Time</span>
              <input type="time" value={reminders.morningTime}
                onChange={e => setReminders(r => ({ ...r, morningTime: e.target.value }))}
                className="bg-transparent text-right text-sm text-accent outline-none" />
            </Row>
          )}
          <ToggleRow
            label="Evening reminder"
            value={reminders.eveningEnabled}
            onChange={v => setReminders(r => ({ ...r, eveningEnabled: v }))}
          />
          {reminders.eveningEnabled && (
            <Row>
              <span className="text-sm text-foreground">Time</span>
              <input type="time" value={reminders.eveningTime}
                onChange={e => setReminders(r => ({ ...r, eveningTime: e.target.value }))}
                className="bg-transparent text-right text-sm text-accent outline-none" />
            </Row>
          )}
        </Section>

        {/* Morning commitment */}
        <Section title="Morning commitment">
          <Row>
            <span className="text-sm text-foreground">Tomorrow at</span>
            <input type="time" value={commitment}
              onChange={e => setCommitment(e.target.value)}
              className="bg-transparent text-right text-sm text-accent outline-none" />
          </Row>
        </Section>

        {/* Save */}
        <button
          onClick={save}
          className="flex items-center justify-center gap-2 rounded-2xl bg-accent py-3.5 text-center font-semibold text-accent-foreground active:scale-[0.98] transition-transform"
        >
          <Save className="h-4 w-4" />
          Save
        </button>

        {/* Data */}
        <Section title="Data">
          <button
            onClick={handleReset}
            className="w-full rounded-2xl bg-card px-5 py-4 text-left text-sm text-destructive"
          >
            Reset all data
          </button>
        </Section>

        <p className="pb-4 text-center text-xs text-muted-foreground">Sit · v0.1</p>
      </motion.div>
    </div>
  );
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">{title}</p>
      <div className="flex flex-col gap-1">{children}</div>
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-card px-5 py-4">
      {children}
    </div>
  );
}

function Chip({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
        active ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'
      }`}
    >
      {children}
    </button>
  );
}

function ToggleRow({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-card px-5 py-4">
      <span className="text-sm text-foreground">{label}</span>
      <button
        onClick={() => onChange(!value)}
        className={`h-7 w-12 rounded-full p-0.5 transition-colors ${value ? 'bg-accent' : 'bg-muted'}`}
      >
        <div className={`h-6 w-6 rounded-full bg-foreground transition-transform ${value ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  );
}

export default SettingsScreen;
