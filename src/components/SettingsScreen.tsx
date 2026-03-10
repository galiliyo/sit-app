import { useState } from 'react';
import { motion } from 'framer-motion';
import { getData, updateData, resetData } from '@/lib/store';

const SettingsScreen = () => {
  const data = getData();
  const [settings, setSettings] = useState(data.settings);
  const [reminders, setReminders] = useState(data.reminders);
  const [commitment, setCommitment] = useState(data.morningCommitmentTime || '07:30');

  const save = () => {
    updateData(d => ({ ...d, settings, reminders, morningCommitmentTime: commitment }));
  };

  const handleReset = () => {
    if (confirm('Reset all data? This cannot be undone.')) {
      resetData();
      window.location.reload();
    }
  };

  return (
    <div className="flex min-h-screen flex-col px-6 pb-24 pt-14">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6">
        <h1 className="text-xl font-semibold text-foreground">Settings</h1>

        {/* Reminders */}
        <Section title="Reminders">
          <ToggleRow
            label="Morning reminder"
            value={reminders.morningEnabled}
            onChange={v => { setReminders(r => ({ ...r, morningEnabled: v })); }}
          />
          {reminders.morningEnabled && (
            <InputRow label="Time" value={reminders.morningTime} type="time"
              onChange={v => setReminders(r => ({ ...r, morningTime: v }))} />
          )}
          <ToggleRow
            label="Evening reminder"
            value={reminders.eveningEnabled}
            onChange={v => setReminders(r => ({ ...r, eveningEnabled: v }))}
          />
          {reminders.eveningEnabled && (
            <InputRow label="Time" value={reminders.eveningTime} type="time"
              onChange={v => setReminders(r => ({ ...r, eveningTime: v }))} />
          )}
        </Section>

        {/* Goals */}
        <Section title="Goals">
          <div className="flex items-center justify-between rounded-2xl bg-card px-5 py-4">
            <span className="text-sm text-foreground">Weekly goal</span>
            <div className="flex items-center gap-3">
              {[3, 5, 7].map(n => (
                <button
                  key={n}
                  onClick={() => setSettings(s => ({ ...s, weeklyGoal: n }))}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                    settings.weeklyGoal === n ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {n}/wk
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between rounded-2xl bg-card px-5 py-4">
            <span className="text-sm text-foreground">Minimum sit</span>
            <span className="text-sm text-muted-foreground">{settings.minimumSitMinutes} min</span>
          </div>
        </Section>

        {/* Timer defaults */}
        <Section title="Timer defaults">
          <div className="flex items-center justify-between rounded-2xl bg-card px-5 py-4">
            <span className="text-sm text-foreground">Quick-start duration</span>
            <div className="flex items-center gap-2">
              {[5, 10, 15].map(n => (
                <button
                  key={n}
                  onClick={() => setSettings(s => ({ ...s, defaultQuickStartMinutes: n }))}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                    settings.defaultQuickStartMinutes === n ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {n}m
                </button>
              ))}
            </div>
          </div>
        </Section>

        {/* Morning commitment */}
        <Section title="Morning commitment">
          <InputRow label="Tomorrow at" value={commitment} type="time"
            onChange={setCommitment} />
        </Section>

        {/* Save */}
        <button
          onClick={save}
          className="rounded-2xl bg-primary py-3.5 text-center font-semibold text-primary-foreground active:scale-[0.98]"
        >
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

function InputRow({ label, value, type, onChange }: { label: string; value: string; type: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-card px-5 py-4">
      <span className="text-sm text-foreground">{label}</span>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-24 bg-transparent text-right text-sm text-accent outline-none"
      />
    </div>
  );
}

export default SettingsScreen;
