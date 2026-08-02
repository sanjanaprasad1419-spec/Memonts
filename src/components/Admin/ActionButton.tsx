import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface ActionButtonProps {
  label: string;
  icon?: LucideIcon;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  label,
  icon: Icon,
  variant = 'primary',
  onClick,
  disabled = false,
  type = 'button',
}) => {
  const variantStyles = {
    primary:
      'bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 hover:from-rose-500 hover:via-pink-500 hover:to-amber-500 text-white border-rose-500/30 shadow-lg shadow-rose-600/10',
    secondary:
      'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-800 hover:border-slate-700',
    danger:
      'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/30 hover:border-rose-500/50',
    ghost:
      'bg-transparent hover:bg-slate-800/50 text-slate-400 hover:text-slate-200 border-transparent',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm border transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${variantStyles[variant]}`}
    >
      {Icon && <Icon className="w-4 h-4 shrink-0" />}
      <span>{label}</span>
    </button>
  );
};
