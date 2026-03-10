import React from 'react';

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

const Section = ({ title, children }: SectionProps) => (
  <div>
    <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">{title}</p>
    <div className="flex flex-col gap-1">{children}</div>
  </div>
);

export default Section;
