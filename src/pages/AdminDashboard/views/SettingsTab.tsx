import React from 'react';
import { PageHeader } from '../../../components/Admin/PageHeader';
import { SectionTitle } from '../../../components/Admin/SectionTitle';
import { ActionButton } from '../../../components/Admin/ActionButton';
import { Moon, Info, ShieldAlert, LogOut, Heart } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export const SettingsTab: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <PageHeader
        title="Admin Settings"
        subtitle="System metadata, application configuration, and account preferences"
      />

      {/* App Configuration Section */}
      <div className="backdrop-blur-md bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 space-y-6">
        <SectionTitle title="Application Overview" description="Core details regarding the surprise platform" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Application Name
            </span>
            <p className="text-base font-bold text-white flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500/20" />
              Happy BirthDay Love
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Theme Mode
            </span>
            <p className="text-base font-bold text-white flex items-center gap-2">
              <Moon className="w-4 h-4 text-purple-400" />
              Premium Dark Glassmorphism
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Version
            </span>
            <p className="text-base font-bold text-white flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-400" />
              1.0.0 (Stage 2 CMS)
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              About
            </span>
            <p className="text-sm font-medium text-slate-300">
              Surprise Birthday Web Application & CMS
            </p>
          </div>
        </div>
      </div>

      {/* Account Actions & Danger Zone */}
      <div className="backdrop-blur-md bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 space-y-6">
        <SectionTitle title="Account & Actions" description="Session security and management controls" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
          <div>
            <h4 className="font-bold text-slate-200 text-sm">Log Out of Admin Session</h4>
            <p className="text-xs text-slate-400">Terminates current session and returns to login.</p>
          </div>
          <ActionButton label="Log Out" icon={LogOut} variant="secondary" onClick={handleLogout} />
        </div>

        <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/20 space-y-4">
          <div className="flex items-center gap-2 text-rose-400">
            <ShieldAlert className="w-5 h-5" />
            <h4 className="font-bold text-sm">Danger Zone</h4>
          </div>
          <p className="text-xs text-slate-400">
            System resets are disabled in static preview mode. All data is managed locally in memory and browser local storage.
          </p>
          <ActionButton label="Reset Local Cache" variant="danger" disabled={true} />
        </div>
      </div>
    </div>
  );
};
