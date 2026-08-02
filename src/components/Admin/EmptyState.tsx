import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  isDisabled?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  isDisabled = false,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-10 sm:p-14 text-center backdrop-blur-md bg-slate-900/40 border border-slate-800/60 rounded-3xl space-y-5">
      <div className="w-20 h-20 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center shadow-inner relative group">
        <div className="absolute inset-0 bg-gradient-to-tr from-rose-500/10 to-amber-500/10 rounded-3xl blur-md"></div>
        <Icon className="w-10 h-10 text-slate-500 group-hover:text-rose-400 transition-colors duration-200 relative z-10" />
      </div>

      <div className="space-y-1.5 max-w-sm">
        <h3 className="text-xl font-bold text-slate-200 tracking-tight">{title}</h3>
        <p className="text-sm text-slate-400">{description}</p>
      </div>

      {actionLabel && (
        <button
          onClick={onAction}
          disabled={isDisabled}
          className={`px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm border transition-all duration-200 ${
            isDisabled
              ? 'bg-slate-900/60 border-slate-800 text-slate-500 cursor-not-allowed opacity-60'
              : 'bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 border-rose-500/30 text-white shadow-lg cursor-pointer'
          }`}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
