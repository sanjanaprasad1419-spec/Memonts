import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { ChevronRight } from 'lucide-react';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  onClick: () => void;
  accentColor?: 'rose' | 'amber' | 'purple' | 'blue' | 'pink' | 'emerald';
  badge?: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  icon: Icon,
  onClick,
  accentColor = 'rose',
  badge,
}) => {
  const colorStyles = {
    rose: 'from-rose-500/20 via-pink-500/10 to-transparent border-rose-500/30 text-rose-400 shadow-rose-500/5 hover:border-rose-500/60',
    amber: 'from-amber-500/20 via-orange-500/10 to-transparent border-amber-500/30 text-amber-400 shadow-amber-500/5 hover:border-amber-500/60',
    purple: 'from-purple-500/20 via-indigo-500/10 to-transparent border-purple-500/30 text-purple-400 shadow-purple-500/5 hover:border-purple-500/60',
    blue: 'from-blue-500/20 via-cyan-500/10 to-transparent border-blue-500/30 text-blue-400 shadow-blue-500/5 hover:border-blue-500/60',
    pink: 'from-pink-500/20 via-rose-500/10 to-transparent border-pink-500/30 text-pink-400 shadow-pink-500/5 hover:border-pink-500/60',
    emerald: 'from-emerald-500/20 via-teal-500/10 to-transparent border-emerald-500/30 text-emerald-400 shadow-emerald-500/5 hover:border-emerald-500/60',
  };

  return (
    <div
      onClick={onClick}
      className={`group relative backdrop-blur-xl bg-slate-900/60 border rounded-3xl p-6 sm:p-7 transition-all duration-300 hover:-translate-y-1.5 cursor-pointer shadow-xl overflow-hidden flex flex-col justify-between ${colorStyles[accentColor]}`}
    >
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br bg-current opacity-10 rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-500"></div>

      <div className="space-y-4 relative z-10">
        <div className="flex items-center justify-between">
          <div className="w-14 h-14 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-300">
            <Icon className="w-7 h-7" />
          </div>

          {badge && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-900 text-slate-300 border border-slate-800">
              {badge}
            </span>
          )}
        </div>

        <div className="space-y-1">
          <h3 className="text-xl font-bold text-white group-hover:text-rose-200 transition-colors">
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            {description}
          </p>
        </div>
      </div>

      <div className="pt-6 flex items-center justify-between text-xs font-semibold text-slate-400 group-hover:text-white transition-colors relative z-10">
        <span>Explore</span>
        <div className="w-8 h-8 rounded-full bg-slate-950/60 border border-slate-800 flex items-center justify-center group-hover:bg-rose-500/20 group-hover:border-rose-500/40 transition-colors">
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-rose-300 group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>
    </div>
  );
};
