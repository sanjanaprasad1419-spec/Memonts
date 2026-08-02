import React from 'react';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  align?: 'center' | 'left';
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  badge,
  align = 'center',
}) => {
  const alignmentClass = align === 'center' ? 'text-center items-center' : 'text-left items-start';

  return (
    <div className={`flex flex-col ${alignmentClass} space-y-2 mb-8 animate-fadeIn`}>
      {badge && (
        <span className="px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/30 shadow-sm">
          {badge}
        </span>
      )}
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-rose-200 bg-clip-text text-transparent">
        {title}
      </h1>
      {subtitle && (
        <p className="text-sm sm:text-base text-slate-400 font-medium max-w-xl">
          {subtitle}
        </p>
      )}
    </div>
  );
};
