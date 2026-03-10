import React from 'react';

interface ChipProps {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}

const Chip = ({ children, active, onClick }: ChipProps) => (
  <button
    onClick={onClick}
    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
      active ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'
    }`}
  >
    {children}
  </button>
);

export default Chip;
