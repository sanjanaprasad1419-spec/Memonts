import React from 'react';
import { SidebarItem } from './SidebarItem';
import {
  LayoutDashboard,
  Calendar,
  Image as ImageIcon,
  FileText,
  Mic,
  Video,
  Music as MusicIcon,
  Settings as SettingsIcon,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Heart,
  X,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export type AdminTab =
  | 'dashboard'
  | 'memory-manager'
  | 'events'
  | 'gallery'
  | 'letters'
  | 'voice-notes'
  | 'videos'
  | 'music'
  | 'settings';

interface AdminSidebarProps {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  counts?: {
    events: number;
    photos: number;
    letters: number;
    videos: number;
    voiceNotes: number;
    music: number;
  };
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  setActiveTab,
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
  counts = { events: 1, photos: 0, letters: 0, videos: 0, voiceNotes: 0, music: 0 },
}) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  interface NavItem {
    id: AdminTab;
    label: string;
    icon: any;
    badge?: number;
  }

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'memory-manager', label: 'Memory Manager', icon: ImageIcon },
    { id: 'events', label: 'Events', icon: Calendar, badge: counts.events },
    { id: 'gallery', label: 'Gallery', icon: ImageIcon, badge: counts.photos },
    { id: 'letters', label: 'Letters', icon: FileText, badge: counts.letters },
    { id: 'voice-notes', label: 'Voice Notes', icon: Mic, badge: counts.voiceNotes },
    { id: 'videos', label: 'Videos', icon: Video, badge: counts.videos },
    { id: 'music', label: 'Music', icon: MusicIcon, badge: counts.music },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-950/95 backdrop-blur-xl border-r border-slate-800/80 select-none">
      {/* Brand Header */}
      <div className="p-4 flex items-center justify-between border-b border-slate-800/60 h-16">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 p-0.5 shadow-md shadow-rose-500/20 shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Heart className="w-5 h-5 text-rose-500 fill-rose-500/20" />
            </div>
          </div>
          {!isCollapsed && (
            <div className="flex flex-col truncate">
              <span className="font-bold text-sm tracking-tight text-white truncate">
                Admin Panel
              </span>
              <span className="text-[10px] text-slate-400 truncate">
                Surprise CMS
              </span>
            </div>
          )}
        </div>

        {/* Desktop Collapse Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* Mobile Close Button */}
        <button
          onClick={() => setIsMobileOpen(false)}
          className="lg:hidden p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
        {navItems.map((item) => (
          <SidebarItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            isActive={activeTab === item.id}
            isCollapsed={isCollapsed}
            badge={item.badge}
            onClick={() => {
              setActiveTab(item.id as AdminTab);
              setIsMobileOpen(false);
            }}
          />
        ))}
      </div>

      {/* Logout Footer */}
      <div className="p-3 border-t border-slate-800/60">
        <SidebarItem
          icon={LogOut}
          label="Logout"
          isActive={false}
          isCollapsed={isCollapsed}
          onClick={handleLogout}
        />
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Permanent Sidebar */}
      <aside
        className={`hidden lg:block h-screen sticky top-0 transition-all duration-300 z-30 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden animate-fadeIn"
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={`fixed top-0 bottom-0 left-0 w-64 z-50 lg:hidden transition-transform duration-300 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
};
