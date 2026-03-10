import React from 'react';

interface RowProps {
  children: React.ReactNode;
}

const Row = ({ children }: RowProps) => (
  <div className="flex items-center justify-between rounded-2xl bg-card px-5 py-4">
    {children}
  </div>
);

export default Row;
