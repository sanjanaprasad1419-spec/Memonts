import React from 'react';
import { Sparkles, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface UserNavbarProps {
  currentSectionTitle: string;
  onNavigateHome: () => void;
}

export const UserNavbar: React.FC<UserNavbarProps> = ({ currentSectionTitle, onNavigateHome }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 h-16 backdrop-blur-md bg-slate-950/80 border-b border-slate-800/60 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
      {/* Left: Brand Logo & Title */}
      <button
        onClick={onNavigateHome}
        className="flex items-center gap-2.5 group cursor-pointer text-left"
      >
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 via-pink-500 to-amber-400 p-0.5 shadow-md shadow-rose-500/20 group-hover:scale-105 transition-transform">
          <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-rose-400" />
          </div>
        </div>
        <div className="flex flex-col">
          <span className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-rose-300 via-pink-200 to-amber-200 bg-clip-text text-transparent">
            OurVerse
          </span>
        </div>
      </button>

      {/* Center: Current Section Name & Skip Intro Shortcut */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-xs font-semibold text-slate-300 tracking-wide">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
          <span>{currentSectionTitle}</span>
        </div>
      </div>

      {/* Right: Profile & Logout */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800">
          <UserIcon className="w-3.5 h-3.5 text-rose-400" />
          <span className="text-xs font-semibold text-slate-200">
            {user?.username || 'Shuxbm'}
          </span>
        </div>

        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-slate-900 hover:bg-rose-500/20 border border-slate-800 hover:border-rose-500/40 transition-all duration-200 cursor-pointer"
          title="Logout"
        >
          <LogOut className="w-4 h-4 text-rose-400" />
          <span className="hidden md:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};
