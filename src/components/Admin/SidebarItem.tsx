import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  isActive: boolean;
  isCollapsed: boolean;
  onClick: () => void;
  badge?: string | number;
}

export const SidebarItem: React.FC<SidebarItemProps> = ({
  icon: Icon,
  label,
  isActive,
  isCollapsed,
  onClick,
  badge,
}) => {
  return (
    <button
      onClick={onClick}
      title={isCollapsed ? label : undefined}
      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer group relative ${
        isActive
          ? 'bg-gradient-to-r from-rose-500/20 to-purple-500/20 border border-rose-500/30 text-white shadow-md shadow-rose-500/10'
          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
      }`}
    >
      <Icon
        className={`w-5 h-5 shrink-0 transition-colors duration-200 ${
          isActive ? 'text-rose-400' : 'text-slate-400 group-hover:text-slate-200'
        }`}
      />
      {!isCollapsed && <span className="truncate">{label}</span>}

      {!isCollapsed && badge !== undefined && (
        <span className="ml-auto px-2 py-0.5 text-[10px] font-semibold rounded-full bg-slate-800 text-slate-300 border border-slate-700">
          {badge}
        </span>
      )}

      {/* Indicator bar for active item */}
      {isActive && (
        <div className="absolute left-0 top-2 bottom-2 w-1 bg-gradient-to-b from-rose-500 to-amber-500 rounded-r-full"></div>
      )}
    </button>
  );
};
