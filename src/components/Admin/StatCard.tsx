import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  title: string;
  count: number | string;
  accentColor?: 'rose' | 'amber' | 'purple' | 'blue' | 'emerald' | 'pink';
}

export const StatCard: React.FC<StatCardProps> = ({
  icon: Icon,
  title,
  count,
  accentColor = 'rose',
}) => {
  const colorMap = {
    rose: {
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/20',
      text: 'text-rose-400',
      glow: 'shadow-rose-500/5',
    },
    amber: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      text: 'text-amber-400',
      glow: 'shadow-amber-500/5',
    },
    purple: {
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20',
      text: 'text-purple-400',
      glow: 'shadow-purple-500/5',
    },
    blue: {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
      text: 'text-blue-400',
      glow: 'shadow-blue-500/5',
    },
    emerald: {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      text: 'text-emerald-400',
      glow: 'shadow-emerald-500/5',
    },
    pink: {
      bg: 'bg-pink-500/10',
      border: 'border-pink-500/20',
      text: 'text-pink-400',
      glow: 'shadow-pink-500/5',
    },
  };

  const style = colorMap[accentColor];

  return (
    <div
      className={`relative backdrop-blur-md bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 shadow-lg ${style.glow} hover:border-slate-700/80 transition-all duration-200 group`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          {title}
        </span>
        <div className={`p-2 rounded-xl ${style.bg} ${style.border} border`}>
          <Icon className={`w-5 h-5 ${style.text}`} />
        </div>
      </div>
      <div className="text-3xl font-extrabold text-white tracking-tight group-hover:scale-105 transition-transform duration-200 origin-left">
        {count}
      </div>
    </div>
  );
};
