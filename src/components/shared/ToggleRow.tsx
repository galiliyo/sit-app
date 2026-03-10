interface ToggleRowProps {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}

const ToggleRow = ({ label, value, onChange }: ToggleRowProps) => (
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

export default ToggleRow;
