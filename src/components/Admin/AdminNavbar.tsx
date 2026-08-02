import React from 'react';
import { Menu, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface AdminNavbarProps {
  pageTitle: string;
  onOpenMobileMenu: () => void;
}

export const AdminNavbar: React.FC<AdminNavbarProps> = ({ pageTitle, onOpenMobileMenu }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-20 h-16 backdrop-blur-md bg-slate-950/80 border-b border-slate-800/60 px-4 sm:px-6 flex items-center justify-between">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
          title="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white capitalize">
          {pageTitle}
        </h2>
      </div>

      {/* Right: User Avatar, Badge, Logout */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* User Badge */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-800">
          {/* Avatar Placeholder */}
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-slate-950 font-bold text-xs shadow-inner">
            {user?.username ? user.username.charAt(0).toUpperCase() : 'A'}
          </div>

          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-semibold text-slate-200 leading-tight">
              {user?.username || 'Admin'}
            </span>
            <span className="text-[10px] text-amber-400 font-medium tracking-wider uppercase leading-none">
              {user?.role || 'admin'}
            </span>
          </div>

          <span className="sm:hidden px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30">
            Admin
          </span>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-rose-500/20 border border-slate-800 hover:border-rose-500/40 transition-all duration-200 cursor-pointer shadow-sm"
          title="Logout"
        >
          <LogOut className="w-4 h-4 text-rose-400" />
          <span className="hidden md:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};
