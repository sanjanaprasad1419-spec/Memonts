import React from 'react';

interface SectionTitleProps {
  title: string;
  description?: string;
}

export const SectionTitle: React.FC<SectionTitleProps> = ({ title, description }) => {
  return (
    <div className="mb-4">
      <h2 className="text-lg font-bold text-slate-100 tracking-tight">{title}</h2>
      {description && <p className="text-xs text-slate-400 mt-0.5">{description}</p>}
    </div>
  );
};
